package fr.gouv.vitamui.pastis.util.pua;

import fr.gouv.vitamui.pastis.model.ElementProperties;
import fr.gouv.vitamui.pastis.util.PuaPastisValidator;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.Iterator;
import java.util.List;

@Service
public class PuaFromJSON {

    @Autowired
    private PuaPastisValidator puaPastisValidator;

    private static final Logger LOGGER = LoggerFactory.getLogger(JsonFromPUA.class);

    private static final String schema = "http://json-schema.org/draft-04/schema";

    private static final String type = "object";

    private static final Boolean additionalProperties = false;


    public String getControlSchemaFromElementProperties(ElementProperties elementProperties) throws IOException {
        // We use a JSONObject instead of POJO, since Jackson and Gson will add unnecessary
        // backslashes during mapping string object values back to string;
        JSONObject controlSchema = puaPastisValidator.sortedJSONObject();
        // 1. Add Schema
        controlSchema.put("$schema",schema);
        // 2. Add  type
        controlSchema.put("type",type);
        // 3. Add additionProperties
        controlSchema.put("additionalProperties",additionalProperties);
        // 4. Check if tree contains Management metadata
        controlSchema = addPatternProperties(elementProperties,controlSchema);
        List<ElementProperties> elementsForTree = puaPastisValidator.ignoreMetadata(elementProperties);

        controlSchema.put("required",puaPastisValidator.getHeadRequired(elementsForTree));

        //controlSchema.put("required",puaPastisValidator.getRequiredProperties(elementProperties));
        // 5. Add definitions;
        JSONObject definitionsFromBasePua = puaPastisValidator.getDefinitionsFromExpectedProfile();
        controlSchema.put("definitions",definitionsFromBasePua);
        // 6. Add ArchiveUnitProfile and the rest of the tree

        JSONArray allElements = puaPastisValidator.getJSONObjectFromAllTree(elementsForTree);
        JSONObject sortedElements = getJSONObjectsFromJSonArray(allElements);
        controlSchema.put("properties",sortedElements);
        // 7. Remove excessive backslashes from mapping strings to objects and vice-versa;
        String cleanedJSON = controlSchema.toString().replaceAll("[\\\\]+","");
        return cleanedJSON;
    }

    public String getDefinitions(){
        return puaPastisValidator.getDefinitionsFromExpectedProfile().toString();
    }

    private JSONObject getJSONObjectsFromJSonArray(JSONArray array){
        JSONObject sortedJSONObject = puaPastisValidator.sortedJSONObject();
        Iterator<Object> iterator = array.iterator();
        while(iterator.hasNext()){
            JSONObject jsonObject = (JSONObject) iterator.next();
            for(String key : jsonObject.keySet()){
                sortedJSONObject.put(key,jsonObject.get(key));
            }
        }
        return sortedJSONObject;
    }

    private JSONObject addPatternProperties(ElementProperties elementProperties, JSONObject controlSchema) throws IOException {
        if (!puaPastisValidator.containsManagement(elementProperties )){
            controlSchema.put("patternProperties", new JSONObject().put("#management",new JSONObject() ));
        }
        return controlSchema;
    }

}
