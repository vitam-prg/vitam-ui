package fr.gouv.vitamui.pastis.util;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.gouv.vitamui.pastis.model.ElementProperties;
import fr.gouv.vitamui.pastis.model.pua.PuaMetadata;
import fr.gouv.vitamui.pastis.model.pua.PuaMetadataDetails;
import fr.gouv.vitamui.pastis.model.seda.SedaNode;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;

@Service
public class PuaPastisValidator {

    private static final Logger LOGGER = LoggerFactory.getLogger(PuaPastisValidator.class);

    private static JSONObject profileJsonExpected;

    private static SedaNode archiveUnitSeda;

    private JSONObject getProfileJsonExpected() {
        if (profileJsonExpected == null) {
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("pua_validation/valid_pua.json");

            assert inputStream != null;
            JSONTokener tokener = new JSONTokener(new InputStreamReader(inputStream));
            profileJsonExpected = new JSONObject(tokener);
        }
        return profileJsonExpected;
    }

    private SedaNode getArchiveUnitSeda() throws IOException {
        if (archiveUnitSeda == null) {
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("pua_validation/archiveUnitSeda.json");
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);
            archiveUnitSeda =  objectMapper.readValue(inputStream, SedaNode.class);
        }
        return archiveUnitSeda;
    }

    /**
     * Validate a PUA JSON file against a template file
     * using LENIENT comparison mode
     *
     * @param pua The string containing the JSON file to be validated
     * @throws IOException
     * @throws AssertionError
     */
    public void validatePUA(JSONObject pua) throws IOException, AssertionError {
        JSONObject profileJsonExpected = getProfileJsonExpected();

        // Compare list of field at the root level
        Set<String> actualFieldList = pua.keySet().stream().collect(toSet());
        Set<String> expectedFieldList = profileJsonExpected.keySet().stream().collect(Collectors.toSet());
        if (!actualFieldList.equals(expectedFieldList)) {
            throw new AssertionError("PUA field list does not contains the expected values");
        }

        // Next tests are controlling the ControlSchema
        String controlSchemaString = pua.getString("ControlSchema");
        JSONObject controlSchemaActual = new JSONObject(controlSchemaString);
        controlSchemaString = profileJsonExpected.getString("ControlSchema");
        JSONObject controlSchemaExpected = new JSONObject(controlSchemaString);

        // Checking that the whole structure is respected. Doesn't care that the pua contains extended fields.
        JSONAssert.assertEquals(controlSchemaExpected, controlSchemaActual, JSONCompareMode.LENIENT);

        // Checking that the definitions list is exactly the same as expected
        JSONAssert.assertEquals(controlSchemaExpected.getJSONObject("definitions"), controlSchemaActual.getJSONObject("definitions"), JSONCompareMode.STRICT);

        // Checking that #management object is present and at the correct position
        if (controlSchemaActual.has("patternProperties")) {
            JSONObject patternProperties = controlSchemaActual.getJSONObject("patternProperties");
            if (patternProperties.has("#management")) {
                JSONAssert.assertEquals(new JSONObject(), patternProperties.getJSONObject("#management"), JSONCompareMode.STRICT);

                // Check that #management is not in both header and 'properties' object
                JSONObject properties = controlSchemaActual.getJSONObject("properties");
                if (properties.has("#management")) {
                    throw new AssertionError("Can't have both '#management' key in header and in 'properties' object");
                }
            }
        } else {
            JSONObject properties = controlSchemaActual.getJSONObject("properties");
            if (!properties.has("#management")) {
                throw new AssertionError("Missing '#management' key in 'properties' object");
            }
            // TODO Verify #management rules structure
            // #HAVEFUN
        }
    }
    public JSONObject getDefinitionsFromExpectedProfile() {

        JSONObject baseProfile = getProfileJsonExpected();
        String controlSchema = baseProfile.get("ControlSchema").toString();
        JSONObject controlSchemaAsJSON = new JSONObject(controlSchema);

        return controlSchemaAsJSON.getJSONObject("definitions");
    }

    /**
     * <p>Finds the seda type of a element based on his name</p>
     * @param elementName the name of the element to search on the archiveUnitSeda.json file
     * @return the seda type of an element
     */
    private String getPUAMetadataType(String elementName) throws IOException {
        SedaNode sedaElement =  getSedaMetadata(elementName);
        return sedaElement != null ?
                resolvePuaType(sedaElement) :
                "undefined";
    }

    /**
     * <p>Resolve the Pua element type based on VITAM given rules</p>
     * @param sedaElement the seda element type of the metadata
     * @return The type of a pua element
     */
    private String resolvePuaType(SedaNode sedaElement) {
        String sedaType = sedaElement.getType();
        String sedaElementType = sedaElement.getElement();
        String sedaName = sedaElement.getName();
        String sedaCardinality = sedaElement.getCardinality();


        if (sedaElementType.equals("Simple") &&
                (sedaCardinality.equals("0-1") || sedaCardinality.equals("1"))) {
            return "string";
        }
        if ((sedaElement.getElement().equals("Complex") &&
                (sedaCardinality.equals("0-1") || sedaCardinality.equals("1"))) || sedaName.equals("Title") || sedaName.equals("Description")) {
            return "object";
        }
        if (sedaType.equals("boolean") && (sedaCardinality.equals("0-1") || sedaCardinality.equals("1"))) {
            return "boolean";
        }
        if (sedaCardinality.equals("1-N") || sedaCardinality.equals("0-N")) {
            return "array";
        }
        return "undefined";
    }

    /**
     * <p>Find and create a single JSONObject based on a given ElementProperties tree if it contains a Management metadata</p>
     * @param elementProperties an ElementProperties object containing Management as root element
     * @return a JSONObject containing a PUA representation of a Management metadata
     */
    private JSONObject getJSONObjectFromMetadata(ElementProperties elementProperties) throws IOException {

        JSONObject puaJSONObject = new JSONObject();
        SedaNode sedaElement = getSedaMetadata("Management");

        ElementProperties elementFound = elementProperties.flattened()
                .filter(childName -> childName.getName().equals("Management")
                        && childName.getType().equals("element")).findAny().orElse(null);

        if (elementFound != null && sedaElement != null) {
            PuaMetadataDetails puaMetadataDetails = new PuaMetadataDetails();
            // get pua type;
            puaMetadataDetails.setType(resolvePuaType(sedaElement));
            puaMetadataDetails.setDescription((elementFound.getDocumentation()));
            // Create a Map<PuaElementName,PuaElementDetails>
            Map<String, PuaMetadataDetails> puaMap = new HashMap<>();
            puaMap.put("Management",puaMetadataDetails);
            puaJSONObject.put("properties",puaMap);
            return puaJSONObject;
        }
        return puaJSONObject;

    }

    /**
     * <p>Recursively generates a tree of JSON objects based on a given ElementProperties object type</p>
     * @param elementsFromTree an ElementProperties List
     * @return a JSONArray representing all PUA elements of an ArchiveUnitProfile and its siblings
     */
    public JSONArray getJSONObjectFromAllTree(List<ElementProperties> elementsFromTree) {

        JSONArray jsonArray = sortedJSONArray();
        List<String> rulesToIgnore = Arrays.asList("StorageRule", "AppraisalRule", "AccessRule", "DisseminationRule",
                "ReuseRule", "ClassificationRule");

        for (ElementProperties el: elementsFromTree){
            try {
                SedaNode sedaElement = getSedaMetadata(el.getName());
                PuaMetadata puaMetadata = new PuaMetadata();
                PuaMetadataDetails puaMetadataDetails = new PuaMetadataDetails();
                getMetaDataFromSeda(el, puaMetadataDetails, sedaElement);
                if(!el.getChildren().isEmpty() && !getRequiredProperties(el).isEmpty()) {
                    puaMetadataDetails.setRequired(getRequiredProperties(el));
                }
                // Create a Map<PuaElementName,PuaElementDetails>
                Map<String, PuaMetadataDetails> puaMap = new HashMap<>();
                puaMap.put(sedaElement.getName(),puaMetadataDetails);

                if (el.getName().equals("Management")) {
                    JSONObject management = getJSONFromManagement(el);
                    jsonArray.put(management);
                } if (jsonArray.length() > 0 &&
                        jsonArray.toString().contains(el.getName())) {
                    ElementProperties element = getElementById(elementsFromTree, el.getParentId());
                    if(element != null && element.getName().equals("Content")){
                        Map<String, PuaMetadataDetails> notManagementMapElement = getJSONObjectFromElement(el,puaMap);
                        jsonArray.put(notManagementMapElement);
                    }else{
                        continue;
                    }
                } else if (!rulesToIgnore.contains(el.getName()) && !el.getName().equals("Content") &&
                        !el.getName().equals("Management")) {
                    Map<String, PuaMetadataDetails> notManagementMapElement = getJSONObjectFromElement(el,puaMap);
                    jsonArray.put(notManagementMapElement);
                }

            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return jsonArray;
    }

    /**
     * <p>Recursively generates a tree of JSON objects starting from the Management metadata</p>
     * @param element an ElementProperties object
     * @return a JSONArray representing all PUA elements of an Management metadata and its specific rules
     */
    public JSONObject getJSONFromManagement(ElementProperties element) throws IOException {
        List<String> rulesMetadata = Arrays.asList("StorageRule", "AppraisalRule", "AccessRule", "DisseminationRule", "ReuseRule", "ClassificationRule");
        List<String> childrenToEncapsulate = Arrays.asList("Rule","StartDate");
        List<String> rulesFound = new ArrayList<>();

        JSONObject pua = sortedJSONObject();
        if (element.getChildren().size() > 0) {
            for (ElementProperties childElement : element.getChildren()) {
                JSONObject childrenOfRule = sortedJSONObject();
                JSONObject grandChildrenOfRule = sortedJSONObject();
                JSONObject propertiesRules = sortedJSONObject();
                // 1. Check special cases
                if (rulesMetadata.contains(childElement.getName())) {
                    PuaMetadataDetails ruleTypeMetadataDetails = new PuaMetadataDetails();
                    PuaMetadataDetails nonSpecialChildOfRuleDetails = new PuaMetadataDetails();
                    SedaNode sedaElement = getSedaMetadata(childElement.getName());
                    if(childElement.getCardinality().equals("1") && sedaElement.getElement().equals("Complex"))
                        rulesFound.add(childElement.getName());
                    getMetaDataFromSeda(childElement, ruleTypeMetadataDetails, sedaElement);
                    Map ruleTypeMetadataMap = new HashMap<String, PuaMetadataDetails>();
                    Map nonSpecialChildOfRule = new HashMap<String, PuaMetadataDetails>();

                    List <String> requiredNonSpecialChildren = new ArrayList<>();
                    List <String> requiredChildren = new ArrayList<>();
                    // 2. If special cases have children, encapsulate them into "Rules : { items : {childName : { ..."
                    if (childElement.getChildren().size() > 0 ) {
                        for (ElementProperties grandChild : childElement.getChildren()) {
                            SedaNode node = getSedaMetadata(grandChild.getName());
                            if (childrenToEncapsulate.contains(grandChild.getName())) {
                                PuaMetadataDetails childOfRuleDetails = new PuaMetadataDetails();
                                getMetaDataFromSeda(grandChild, childOfRuleDetails, node);
                                if(grandChild.getCardinality().equals("0-1") || grandChild.getCardinality().equals("1"))
                                    requiredChildren.add(grandChild.getName());
                                ObjectMapper mapper = new ObjectMapper();
                                mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
                                JSONObject childProperties = new JSONObject(mapper.writeValueAsString(childOfRuleDetails));
                                grandChildrenOfRule.put(grandChild.getName(), childProperties);
                                ruleTypeMetadataDetails.setProperties(grandChildrenOfRule);
                            } else {
                                nonSpecialChildOfRuleDetails.setType(getPUAMetadataType(childElement.getName()));
                                nonSpecialChildOfRuleDetails.setDescription(grandChild.getDocumentation());
                                nonSpecialChildOfRule.put(grandChild.getName(),nonSpecialChildOfRuleDetails);
                                //Required field
                                requiredNonSpecialChildren.add(grandChild.getName());
                            }
                            ruleTypeMetadataMap.put(childElement.getName(),ruleTypeMetadataDetails);
                        }
                    }
                    // 2. Once the children of special cases are processed, we put them into Rules -> items
                    JSONObject propretyOfItems = new JSONObject().put("properties", grandChildrenOfRule);

                    propretyOfItems.put("required",requiredChildren);

                    childrenOfRule.put("items",propretyOfItems);
                    propertiesRules.put("Rules", childrenOfRule);

                    // 3. Convert to jsonobject via map and update its property
                    JSONObject ruleTypeMetadata = new JSONObject(ruleTypeMetadataMap);
                    ruleTypeMetadata.getJSONObject(childElement.getName()).put("properties",propertiesRules);
                    if(!requiredNonSpecialChildren.isEmpty()) {
                        ruleTypeMetadata.getJSONObject(childElement.getName()).put("required", requiredNonSpecialChildren);
                    }
                    nonSpecialChildOfRule.keySet().forEach(e-> {
                        Object details = nonSpecialChildOfRule.get(e);
                        ruleTypeMetadata.getJSONObject(childElement.getName()).getJSONObject("properties").put(e.toString(),details);
                    });

                    // 4. Set Apprasail Rule (or other rule ) to the root properties of the parent pua
                    Map puaParentProperties = new HashMap<String, PuaMetadataDetails>();
                    puaParentProperties.put("properties", propertiesRules);

                    // 5. We retrieve parent properties and add more elements to root element properties
                    pua.accumulate("properties", ruleTypeMetadata.toMap());
                    if(!rulesFound.isEmpty()) pua.put("required", rulesFound);
                }
            }
        }
        return retrieveAccumulatedJsonManagementProperties(pua);
    }

    /**
     * Retrieve the accumulated JSONArray properties from pua
     * @param pua is JSONObjet that contains Management section of PUA
     * Convert it into a JSONObject and put it into a #mangagement key
     */
    public JSONObject retrieveAccumulatedJsonManagementProperties(JSONObject pua){

        JSONObject managementAsJSONObject = new JSONObject();
        if(pua.keySet().contains("properties")){
            JSONObject properties = pua;
            try{
                JSONArray accumulatedProperties = pua.getJSONArray("properties");
                JSONArray accumulatedRequired = pua.getJSONArray("required");
                String propertiesAsString = accumulatedProperties.toString()
                        .substring(1,accumulatedProperties.toString().length() -1)
                        .replaceAll("(},\\{)",",");
                properties = new JSONObject(propertiesAsString);
                JSONObject propertiesRequiredJson = new JSONObject();
                propertiesRequiredJson.put("properties",properties);
                propertiesRequiredJson.put("required",accumulatedRequired);
                managementAsJSONObject.put("#management",propertiesRequiredJson);
            }catch (JSONException e){
                LOGGER.info(e.getMessage());
                managementAsJSONObject.put("#management",pua);
            }
        }else{
            managementAsJSONObject.put("#management",new JSONObject());
        }
        return managementAsJSONObject;
    }

    /**
     * <p>Recursively searches for a seda node metadata based on a name</p>
     * @param elementName the name of the seda element to be found
     * @return a SedaNode object representation of a given seda element
     */

    private SedaNode getSedaMetadata(String elementName) throws IOException {
        SedaNode sedaTree = getArchiveUnitSeda();

        return sedaTree.flattened()
                .filter(childName -> childName.getName().equals(elementName)).findAny().orElse(null);
    }

    /**
     * <p>Order a JSONObject</p>
     * @return an ordered JSONObject
     */
    public JSONObject sortedJSONObject() {
        JSONObject jsonObj = new JSONObject();
        try {
            Field changeMap = jsonObj.getClass().getDeclaredField("map");
            changeMap.setAccessible(true);
            changeMap.set(jsonObj, new LinkedHashMap<>());
            changeMap.setAccessible(false);
        } catch (IllegalAccessException | NoSuchFieldException e) {
        }
        return jsonObj;
    }

    /**
     * <p>Order a JSONOArray</p>
     * @return an ordered JSONArray
     */
    public JSONArray sortedJSONArray() {
        JSONArray jsonArray = new JSONArray();
        try {
            Field changeMap = jsonArray.getClass().getDeclaredField("map");
            changeMap.setAccessible(true);
            changeMap.set(jsonArray, new LinkedHashMap<>());
            changeMap.setAccessible(false);
        } catch (IllegalAccessException | NoSuchFieldException e) {
            LOGGER.info(e.getMessage());
        }
        return jsonArray;
    }

    /**
     * <p>Checks if an object of type ElementProperties contains, and its children, contains a Management</p>
     * @return true if an given ElementProperties object contains a Management metadata
     */
    public boolean containsManagement(ElementProperties elementProperties) throws IOException {
        return getJSONObjectFromMetadata(elementProperties).length() > 0;
    }

    /**
     * <p>Recursively converts an ElementProperty tree and its children, into a Map</p>
     * @return a HashMap containing a tree of Pua metadata and its children
     */
    public Map<String, PuaMetadataDetails> getJSONObjectFromElement(ElementProperties elementProperties, Map<String, PuaMetadataDetails> parentElement)
            throws IOException {
        if (elementProperties.getChildren().size() > 0) {
            Map <String, PuaMetadataDetails> childMap = new HashMap<>();
            for (ElementProperties el:elementProperties.getChildren()){
                PuaMetadataDetails puaMetadataDetails = new PuaMetadataDetails();
                puaMetadataDetails.setType(getPUAMetadataType(el.getName()));
                puaMetadataDetails.setDescription(el.getDocumentation());
                childMap.put(el.getName(),puaMetadataDetails);

                if (el.getChildren().size() > 0) {
                    getJSONObjectFromElement(el,parentElement);
                }
            }
            parentElement.get(elementProperties.getName()).setProperties(new JSONObject(childMap));
        }
        return parentElement;
    }
    public List<String> getRequiredProperties(ElementProperties elementProperties){
        List<String> listRequired = new ArrayList<>();
        elementProperties.getChildren().forEach(child -> {
            if(child.getCardinality().equals("0-1") || child.getCardinality().equals("1"))
                listRequired.add(child.getName());
        });
        return listRequired;
    }

    public List<ElementProperties> ignoreMetadata(ElementProperties elementProperties){
        List<String> metadataToIgnore = Arrays.asList("DescriptiveMetadata","ArchiveUnit");
        List<ElementProperties> elementsFromTree =
                elementProperties.flattened()
                        .filter(child -> !metadataToIgnore.contains(child.getName())
                                && child.getType().equals("element")).collect(toList());
        return elementsFromTree;
    }

    public List<String> getHeadRequired(List<ElementProperties> elementsFromTree) {
        List<String> list = new ArrayList<>();
        elementsFromTree.forEach((element) -> {
            try {
                SedaNode sedaElement =  getSedaMetadata(element.getName());
                ElementProperties parent = getElementById(elementsFromTree, element.getParentId());
                if ( (parent!= null && parent.getName().equals("Content") && !sedaElement.getCardinality().equals("0-N"))
                        || (parent == null && element.getName().equals("ArchiveUnitProfile"))) {
                    list.add(element.getName());
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        return list;
    }

    public void getMetaDataFromSeda(ElementProperties el, PuaMetadataDetails puaMetadataDetails, SedaNode sedaElement){
        // get pua type;
        puaMetadataDetails.setType(resolvePuaType(sedaElement));
        puaMetadataDetails.setDescription((el.getDocumentation()));
        if(sedaElement.getElement().equals("Complex") && el.getPuaData() != null){
            if(el.getPuaData().getAdditionalProperties() != null){
                puaMetadataDetails.setAdditionalProperties(el.getPuaData().getAdditionalProperties());
            }
        }
        if((el.getCardinality() != null &&
                el.getCardinality().equals("0-1") && sedaElement.getCardinality().equals("0-N"))) {
            puaMetadataDetails.setMinItems(0);
            puaMetadataDetails.setMaxItems(1);
        }
        if(!sedaElement.getEnumeration().isEmpty()){
            puaMetadataDetails.setEnumerations(sedaElement.getEnumeration());
        }

    }

    public ElementProperties getElementById(List<ElementProperties> elementProperties, Long id){

        for (ElementProperties el: elementProperties){
            if(el.getId() == id) return el;
        }
        return null;
    }
}
