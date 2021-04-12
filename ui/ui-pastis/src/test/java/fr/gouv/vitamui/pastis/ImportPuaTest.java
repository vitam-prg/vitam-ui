package fr.gouv.vitamui.pastis;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.gouv.vitamui.pastis.model.ElementProperties;
import fr.gouv.vitamui.pastis.model.profiles.Notice;
import fr.gouv.vitamui.pastis.util.PuaPastisValidator;
import fr.gouv.vitamui.pastis.util.pua.JsonFromPUA;
import fr.gouv.vitamui.pastis.util.pua.NoticeFromPUA;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;


@RunWith(SpringRunner.class)
@TestPropertySource(locations = "/application.properties")
public class ImportPuaTest {

    PuaPastisValidator puaPastisValidator = new PuaPastisValidator();
    JsonFromPUA jsonFromPUA = new JsonFromPUA();
    NoticeFromPUA noticeFromPUA = new NoticeFromPUA();

    @Test
    public void testImportOK() throws IOException {
        InputStream inputStreamPua = getClass().getClassLoader().getResourceAsStream("pua/pua_OK.json");

        JSONTokener tokener = new JSONTokener(new InputStreamReader(inputStreamPua));
        JSONObject profileJson = new JSONObject(tokener);
        puaPastisValidator.validatePUA(profileJson);
        ElementProperties profileActual = jsonFromPUA.getProfileFromPUA(profileJson);

        ObjectMapper mapper = new ObjectMapper();
        String fileNodeActual = mapper.writeValueAsString(profileActual);
        JSONObject fileNodeJSONActual = new JSONObject(fileNodeActual);

        Notice notice = noticeFromPUA.getNoticeFromPUA(profileJson);

        InputStream inputStreamExpected = getClass().getClassLoader().getResourceAsStream("pua/profile_Expected.json");
        tokener = new JSONTokener(inputStreamExpected);
        JSONObject fileNodeJSONExpected = new JSONObject(tokener);

        JSONAssert.assertEquals(fileNodeJSONActual, fileNodeJSONExpected, JSONCompareMode.STRICT);
    }

    @Test
    public void testImportOK_with_management() throws IOException {
        InputStream inputStreamPua = getClass().getClassLoader().getResourceAsStream("pua/pua_OK_with_management.json");

        JSONTokener tokener = new JSONTokener(new InputStreamReader(inputStreamPua));
        JSONObject profileJson = new JSONObject(tokener);
        puaPastisValidator.validatePUA(profileJson);
        ElementProperties profileActual = jsonFromPUA.getProfileFromPUA(profileJson);

        ObjectMapper mapper = new ObjectMapper();
        String fileNodeActual = mapper.writeValueAsString(profileActual);
        JSONObject fileNodeJSONActual = new JSONObject(fileNodeActual);

        InputStream inputStreamExpected = getClass().getClassLoader().getResourceAsStream("pua/profile_Expected_with_management.json");
        tokener = new JSONTokener(inputStreamExpected);
        JSONObject fileNodeJSONExpected = new JSONObject(tokener);

        JSONAssert.assertEquals(fileNodeJSONActual, fileNodeJSONExpected, JSONCompareMode.STRICT);
    }

    @Test(expected = AssertionError.class)
    public void testImportNOK_missing_definitions() throws IOException {
        InputStream inputStreamPua = getClass().getClassLoader().getResourceAsStream("pua/pua_NOK_missing_definitions.json");

        JSONTokener tokener = new JSONTokener(new InputStreamReader(inputStreamPua));
        JSONObject profileJson = new JSONObject(tokener);
        puaPastisValidator.validatePUA(profileJson);
        ElementProperties profile = jsonFromPUA.getProfileFromPUA(profileJson);
        ObjectMapper mapper = new ObjectMapper();
        String fileNodeActual = mapper.writeValueAsString(profile);
        Notice notice = noticeFromPUA.getNoticeFromPUA(profileJson);
    }

    @Test(expected = AssertionError.class)
    public void testImportNOK_missing_management() throws IOException {
        InputStream inputStreamPua = getClass().getClassLoader().getResourceAsStream("pua/pua_NOK_missing_management.json");

        JSONTokener tokener = new JSONTokener(new InputStreamReader(inputStreamPua));
        JSONObject profileJson = new JSONObject(tokener);
        puaPastisValidator.validatePUA(profileJson);
        ElementProperties profile = jsonFromPUA.getProfileFromPUA(profileJson);
        ObjectMapper mapper = new ObjectMapper();
        String fileNodeActual = mapper.writeValueAsString(profile);
        Notice notice = noticeFromPUA.getNoticeFromPUA(profileJson);
    }

    @Test(expected = AssertionError.class)
    public void testImportNOK_missing_properties() throws IOException {
        InputStream inputStreamPua = getClass().getClassLoader().getResourceAsStream("pua/pua_NOK_missing_properties.json");

        JSONTokener tokener = new JSONTokener(new InputStreamReader(inputStreamPua));
        JSONObject profileJson = new JSONObject(tokener);
        puaPastisValidator.validatePUA(profileJson);
        ElementProperties profile = jsonFromPUA.getProfileFromPUA(profileJson);
        ObjectMapper mapper = new ObjectMapper();
        String fileNodeActual = mapper.writeValueAsString(profile);
        Notice notice = noticeFromPUA.getNoticeFromPUA(profileJson);
    }

    @Test(expected = AssertionError.class)
    public void testImportNOK_both_management_present() throws IOException {
        InputStream inputStreamPua = getClass().getClassLoader().getResourceAsStream("pua/pua_NOK_both_management_present.json");

        JSONTokener tokener = new JSONTokener(new InputStreamReader(inputStreamPua));
        JSONObject profileJson = new JSONObject(tokener);
        puaPastisValidator.validatePUA(profileJson);
        ElementProperties profile = jsonFromPUA.getProfileFromPUA(profileJson);
        ObjectMapper mapper = new ObjectMapper();
        String fileNodeActual = mapper.writeValueAsString(profile);
        Notice notice = noticeFromPUA.getNoticeFromPUA(profileJson);
    }
}
