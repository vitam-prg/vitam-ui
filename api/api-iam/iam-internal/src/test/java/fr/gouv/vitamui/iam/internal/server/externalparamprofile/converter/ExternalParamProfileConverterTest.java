package fr.gouv.vitamui.iam.internal.server.externalparamprofile.converter;

import com.fasterxml.jackson.databind.JsonNode;
import fr.gouv.vitam.common.exception.InvalidParseOperationException;
import fr.gouv.vitam.common.json.JsonHandler;
import fr.gouv.vitamui.commons.api.domain.ExternalParamProfileDto;
import fr.gouv.vitamui.commons.api.domain.ProfileDto;
import fr.gouv.vitamui.commons.api.domain.Role;
import fr.gouv.vitamui.commons.api.domain.ServicesData;
import fr.gouv.vitamui.iam.internal.server.profile.converter.ProfileConverter;
import fr.gouv.vitamui.iam.internal.server.profile.domain.Profile;
import org.junit.Test;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

public class ExternalParamProfileConverterTest {

    private final ExternalParamProfileConverter externalParamProfileConverter = new ExternalParamProfileConverter();

    @Test
    public void testConvertEntityToDto() throws Exception {
        ExternalParamProfileDto externalParamProfileDto = new ExternalParamProfileDto();
        externalParamProfileDto.setDescription("Description");
        externalParamProfileDto.setEnabled(true);
        externalParamProfileDto.setExternalParamIdentifier("externalParamIdentifier");
        externalParamProfileDto.setIdExternalParam("idExternalParam");
        externalParamProfileDto.setProfileIdentifier("profileIdentifier");
        externalParamProfileDto.setIdProfile("idProfile");
        externalParamProfileDto.setId("idProfile");
        externalParamProfileDto.setName("name");
        externalParamProfileDto.setAccessContract("ContratTNR");

        String json = externalParamProfileConverter.convertToLogbook(externalParamProfileDto);
        assertThat(json).isNotBlank();

        JsonNode jsonNode = JsonHandler.getFromString(json);
        assertThat(jsonNode.get(ExternalParamProfileConverter.EXTERNAL_PARAM_IDENTIFIER)).isNotNull();

        externalParamProfileDto.setExternalParamIdentifier("");
        json = externalParamProfileConverter.convertToLogbook(externalParamProfileDto);
        jsonNode = JsonHandler.getFromString(json);
        assertThat(jsonNode.get(ExternalParamProfileConverter.EXTERNAL_PARAM_IDENTIFIER)).isEmpty();
    }

}
