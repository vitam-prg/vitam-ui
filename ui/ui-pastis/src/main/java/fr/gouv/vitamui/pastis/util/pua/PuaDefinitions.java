package fr.gouv.vitamui.pastis.util.pua;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PuaDefinitions {

    @Value("${pua.definitions.file}")
    private String defintionsFile;

    protected Map<String, Object> definitions;

    @JsonAnyGetter
    public Map<String, Object> getDefinitions() {
        return definitions;
    }

    @JsonAnySetter
    public void setDefinitions(String key, Object value) {
        if (definitions == null) {
            definitions = new HashMap<String, Object>();
        }
        if (key != null) {
            if (value != null) {
                definitions.put(key, value);
            } else {
                definitions.remove(key);
            }
        }

    }
}
