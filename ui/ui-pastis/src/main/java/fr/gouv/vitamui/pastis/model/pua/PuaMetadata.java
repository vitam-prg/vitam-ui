package fr.gouv.vitamui.pastis.model.pua;

import com.google.gson.JsonElement;
import org.codehaus.jackson.annotate.JsonAnyGetter;
import org.codehaus.jackson.annotate.JsonIgnore;

import java.util.HashMap;
import java.util.Map;

public class PuaMetadata extends JsonElement {

    public Map<String, PuaMetadataDetails> puaDetails = new HashMap<String, PuaMetadataDetails>();

    public Map<String, PuaMetadataDetails> getPuaDetails() {
        return puaDetails;
    }

    public void setPuaDetails(Map<String, PuaMetadataDetails> puaDetails) {
        this.puaDetails = puaDetails;
    }

    @Override
    public JsonElement deepCopy() {
        return null;
    }
}
