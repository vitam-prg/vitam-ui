package fr.gouv.vitamui.pastis.util.pua;

import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.gouv.vitamui.pastis.model.ElementProperties;
import fr.gouv.vitamui.pastis.model.PuaData;
import fr.gouv.vitamui.pastis.model.seda.SedaNode;
import fr.gouv.vitamui.pastis.util.RNGConstants;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

import static fr.gouv.vitamui.pastis.util.RNGConstants.typeElement;

@Service
public class JsonFromPUA {
    private static Logger LOGGER = LoggerFactory.getLogger(JsonFromPUA.class);

    private Long idCounter = 0L;

    /**
     * Generates a Profile from a PUA file
     * @param jsonPUA the JSON Object representing the PUA
     * @return
     */
    public ElementProperties getProfileFromPUA(JSONObject jsonPUA) throws IOException {
        String controlSchemaString = (String) jsonPUA.get("ControlSchema");
        JSONObject controlSchema = new JSONObject(controlSchemaString);

        idCounter = 0L;
        // Adding root element DescriptiveMetadata
        ElementProperties root = new ElementProperties();
        root.setName("DescriptiveMetadata");
        root.setId(idCounter++);
        root.setLevel(0);
        root.setType(String.valueOf(RNGConstants.MetadaDataType.element));

        // Adding ArchiveUnit Element
        ElementProperties archiveUnit = createChildren(root, "ArchiveUnit");
        archiveUnit.setType(String.valueOf(RNGConstants.MetadaDataType.element));

        // Adding id element
        ElementProperties id = createChildren(archiveUnit, "id");
        id.setType(String.valueOf(RNGConstants.MetadaDataType.attribute));
        id.setValueOrData("data");
        id.setDataType(String.valueOf(RNGConstants.DataType.ID));

        SedaNode sedaNode = getArchiveUnitSedaNode();

        buildProfile(controlSchema, sedaNode, archiveUnit);

        sortTreeWithSeda(archiveUnit, sedaNode);

        return root;
    }

    /**
     * Sort the ElementProperties tree based on the Seda
     * @param tree
     * @param sedaNode
     */
    public void sortTreeWithSeda(ElementProperties tree, SedaNode sedaNode){
         tree.getChildren().sort(Comparator.comparing(c->sedaNode.getChildren().stream().map(s->s.getName()).collect(Collectors.toList()).indexOf(c.getName())));
         for (ElementProperties e :tree.getChildren()){
             sortTreeWithSeda(e,sedaNode.getChildren().stream().filter(s->s.getName().equals(e.getName())).findFirst().get());
         }
    }

    private List<String> getRequiredFields(JSONObject controlSchema) {
        List<String> required = new ArrayList<>();
        if (controlSchema.has("required")){
            required.addAll(controlSchema.getJSONArray("required").toList().stream().map(o->(String) o).collect(Collectors.toList()));
        }
        return required;
    }

    private SedaNode getArchiveUnitSedaNode() throws IOException {
        InputStream inputStream = getClass().getClassLoader().getResourceAsStream("pua_validation/archiveUnitSeda.json");
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);
        return objectMapper.readValue(inputStream,SedaNode.class);
    }

    /**
     * Get children definition of node by name
     * @param sedaNode node to look for children
     * @param name name of children to look for
     * @return
     */
    private SedaNode getChildrenSedaNode(SedaNode sedaNode, String name){
        String realName = sanitizeNodeName(name);
        return sedaNode.getChildren().stream().filter(c->c.getName().equals(realName)).findAny().orElse(null);
    }

    private String sanitizeNodeName(String name) {
        String realName = name.replace("_","");
        if (realName.equals("#management")) {
            realName = "Management";
        }
        return realName;
    }

    /**
     * Build the profile based on the PUA JSON file and the definition of an ArchiveUnit
     * Recursive
     * @param jsonPUA
     * @param sedaNode
     * @param parent
     */
    private void buildProfile(JSONObject jsonPUA, SedaNode sedaNode, ElementProperties parent) {
        List<String> requiredFields = getRequiredFields(jsonPUA);
        if (jsonPUA.has("properties")) {
            JSONObject properties = jsonPUA.getJSONObject("properties");
            if (properties.length() != 0) {
                for(String propertyName:properties.keySet()){
                    Set<String> childrensNames;
                    JSONObject propertiesNew;
                    List<String> requiredFieldsActual;
                    // If property's name equal 'Rules'
                    // Then we have to retrieve all the the sub-childrens in the Rules->items property
                    if (propertyName.equals("Rules")){
                        requiredFieldsActual = getRequiredFields(properties.getJSONObject(propertyName).getJSONObject("items"));
                        propertiesNew = properties.getJSONObject(propertyName).getJSONObject("items").getJSONObject("properties");
                        childrensNames = propertiesNew.keySet();
                    } else {
                        requiredFieldsActual = requiredFields;
                        propertiesNew = properties;
                        childrensNames = Collections.singleton(propertyName);
                    }
                    childrensNames.forEach(childName -> {
                        JSONObject childPua = propertiesNew.getJSONObject(childName);
                        SedaNode childrenSedaNode = getChildrenSedaNode(sedaNode, childName);

                        ElementProperties childrenParent;
                        // In a PUA the Content node in ArchiveUnit node is omitted.
                        // So if we are in the ArchiveUnit Node, then we must check for the children in Content Node as well
                        if (childrenSedaNode == null && parent.getName().equals("ArchiveUnit")) {
                            childrenSedaNode = getChildrenSedaNode(getChildrenSedaNode(sedaNode, "Content"), childName);

                            ElementProperties content = parent.getChildren().stream().filter(c->c.getName().equals("Content")).findAny().orElse(null);
                            // Create "Content" ElementProperties if not created yet
                            if (content == null) {
                                content = createChildren(parent, "Content");
                                content.setType(String.valueOf(RNGConstants.MetadaDataType.element));
                            }
                            childrenParent = content;
                        } else {
                            childrenParent = parent;
                        }
                        // If the childrenDefinition is found then process the childPua and add it to the childProfile
                        if (childrenSedaNode != null) {
                            ElementProperties childProfile = getElementProperties(childrenSedaNode, childrenParent, childName, childPua, requiredFieldsActual.contains(childName));

                            buildProfile(childPua, childrenSedaNode, childProfile);
                        }
                    });
                };
            }
        }
    }

    /**
     * Build and retrieve an ElementProperties node
     * @param sedaNode
     * @param parent
     * @param key
     * @param childPua
     * @return
     */
    private ElementProperties getElementProperties(SedaNode sedaNode, ElementProperties parent, String key, JSONObject childPua, Boolean required) {
        ElementProperties childProfile = createChildren(parent, key);
        childProfile.setType(typeElement.get(sedaNode.getElement()));
        childProfile.setDataType(sedaNode.getType());

        Integer minItems = null;
        Integer maxItems = null;

        for (String k : childPua.keySet()){
            switch (k){
                case "$ref":
                    addPuadDataToElementIfNotPresent(childProfile);
                    addRefToElement(childProfile, childPua.getString(k));
                    break;
                case "enum":
                    addPuadDataToElementIfNotPresent(childProfile);
                    List<String> enume = childPua.getJSONArray(k).toList().stream().map(o->(String)o).collect(Collectors.toList());
                    childProfile.getPuaData().setEnum(enume);
                    break;
                case "pattern":
                    addPuadDataToElementIfNotPresent(childProfile);
                    childProfile.getPuaData().setPattern(childPua.getString(k));
                    break;
                case "minLength":
                    addPuadDataToElementIfNotPresent(childProfile);
                    childProfile.getPuaData().setMinLenght(childPua.getInt(k));
                    break;
                case "maxLength":
                    addPuadDataToElementIfNotPresent(childProfile);
                    childProfile.getPuaData().setMaxLenght(childPua.getInt(k));
                    break;
                case "minimum":
                    addPuadDataToElementIfNotPresent(childProfile);
                    childProfile.getPuaData().setMinimum(childPua.getInt(k));
                    break;
                case "maximum":
                    addPuadDataToElementIfNotPresent(childProfile);
                    childProfile.getPuaData().setMaximum(childPua.getInt(k));
                    break;
                case "additionalProperties":
                    addPuadDataToElementIfNotPresent(childProfile);
                    childProfile.getPuaData().setAdditionalProperties(childPua.getBoolean(k));
                    break;
                case "exclusiveMinimum":
                    addPuadDataToElementIfNotPresent(childProfile);
                    childProfile.getPuaData().setExclusiveMinimum(childPua.getBoolean(k));
                    break;
                case "exclusiveMaximum":
                    addPuadDataToElementIfNotPresent(childProfile);
                    childProfile.getPuaData().setExclusiveMaximum(childPua.getBoolean(k));
                    break;
                case "description":
                    childProfile.setDocumentation(childPua.getString(k));
                    break;
                case "minItems":
                    minItems = childPua.getInt(k);
                    break;
                case "maxItems":
                    maxItems = childPua.getInt(k);
                    break;
                default:break;
            }
        }
        childProfile.setCardinality(getCardinality(minItems, maxItems, required, sedaNode));

        return childProfile;
    }

    private String getCardinality(Integer minItems, Integer maxItems, Boolean required, SedaNode sedaNode){
        if (required){
            switch (sedaNode.getCardinality()){
                case "1-N":
                case "0-N":
                    return "1-N";
                case "1":
                case "0-1":
                    return "1";
            }
            return "1";
        } else if (minItems!=null && maxItems!=null) {
            return minItems + "-" + maxItems;
        } else {
            return sedaNode.getCardinality();
        }
    }

    private void addPuadDataToElementIfNotPresent(ElementProperties childProfile) {
        if (childProfile.getPuaData() == null) {
            childProfile.setPuaData(new PuaData());
        }
    }

    private void addRefToElement(ElementProperties el, String ref){
        ref = ref.substring(ref.lastIndexOf('/') + 1);
            el.getPuaData().setPattern(ref);
    }

    private ElementProperties createChildren(ElementProperties parent, String name){
        String realName = sanitizeNodeName(name);
        ElementProperties children = new ElementProperties();
        children.setName(realName);
        children.setId(idCounter++);
        children.setParent(parent);
        children.setParentId(parent.getId());
        children.setLevel(parent.getLevel() + 1);
        parent.getChildren().add(children);
        return children;
    }
}
