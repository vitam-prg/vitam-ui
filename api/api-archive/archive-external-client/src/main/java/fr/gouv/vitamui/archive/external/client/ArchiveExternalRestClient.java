/**
 * Copyright French Prime minister Office/SGMAP/DINSIC/Vitam Program (2019-2020)
 * and the signatories of the "VITAM - Accord du Contributeur" agreement.
 * <p>
 * contact@programmevitam.fr
 * <p>
 * This software is a computer program whose purpose is to implement
 * implement a digital archiving front-office system for the secure and
 * efficient high volumetry VITAM solution.
 * <p>
 * This software is governed by the CeCILL-C license under French law and
 * abiding by the rules of distribution of free software.  You can  use,
 * modify and/ or redistribute the software under the terms of the CeCILL-C
 * license as circulated by CEA, CNRS and INRIA at the following URL
 * "http://www.cecill.info".
 * <p>
 * As a counterpart to the access to the source code and  rights to copy,
 * modify and redistribute granted by the license, users are provided only
 * with a limited warranty  and the software's author,  the holder of the
 * economic rights,  and the successive licensors  have only  limited
 * liability.
 * <p>
 * In this respect, the user's attention is drawn to the risks associated
 * with loading,  using,  modifying and/or developing or reproducing the
 * software by the user in light of its specific status of free software,
 * that may mean  that it is complicated to manipulate,  and  that  also
 * therefore means  that it is reserved for developers  and  experienced
 * professionals having in-depth computer knowledge. Users are therefore
 * encouraged to load and test the software's suitability as regards their
 * requirements in conditions enabling the security of their systems and/or
 * data to be ensured and,  more generally, to use and operate it in the
 * same conditions as regards security.
 * <p>
 * The fact that you are presently reading this means that you have had
 * knowledge of the CeCILL-C license and that you accept its terms.
 */

package fr.gouv.vitamui.archive.external.client;

import com.fasterxml.jackson.databind.JsonNode;
import fr.gouv.vitam.common.model.AuditOptions;
import fr.gouv.vitamui.archive.common.dto.UnitDto;
import fr.gouv.vitamui.archive.common.rest.RestApi;
import fr.gouv.vitamui.commons.api.CommonConstants;
import fr.gouv.vitamui.commons.api.domain.PaginatedValuesDto;
import fr.gouv.vitamui.commons.api.logger.VitamUILogger;
import fr.gouv.vitamui.commons.api.logger.VitamUILoggerFactory;
import fr.gouv.vitamui.commons.rest.client.BasePaginatingAndSortingRestClient;
import fr.gouv.vitamui.commons.rest.client.ExternalHttpContext;
import fr.gouv.vitamui.commons.rest.client.InternalHttpContext;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Collections;
import java.util.List;


public class ArchiveExternalRestClient extends BasePaginatingAndSortingRestClient<UnitDto, ExternalHttpContext> {

    private static final VitamUILogger LOGGER = VitamUILoggerFactory.getInstance(ArchiveExternalRestClient.class);

    public ArchiveExternalRestClient(final RestTemplate restTemplate, final String baseUrl) {
        super(restTemplate, baseUrl);
    }

    @Override
    protected Class<UnitDto> getDtoClass() {
        return UnitDto.class;
    }

    @Override
    protected ParameterizedTypeReference<List<UnitDto>> getDtoListClass() {
        return new ParameterizedTypeReference<List<UnitDto>>() {
        };
    }

    @Override
    protected ParameterizedTypeReference<PaginatedValuesDto<UnitDto>> getDtoPaginatedClass() {
        return new ParameterizedTypeReference<PaginatedValuesDto<UnitDto>>() {
        };
    }

    public ResponseEntity<String> sendMessage(ExternalHttpContext context) {
        final UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(getUrl() + "/message");
        final HttpEntity<AuditOptions> request = new HttpEntity<>(buildHeaders(context));
        return restTemplate.exchange(uriBuilder.build().toUri(), HttpMethod.GET, request, String.class);
    }

    @Override
    public String getPathUrl() {
        return RestApi.ARCHIVE;
    }

    protected Class<JsonNode> getJsonNodeClass() {
        return JsonNode.class;
    }

    public JsonNode findUnitByDsl(ExternalHttpContext context, JsonNode dsl) {
        MultiValueMap<String, String> headers = buildSearchHeaders(context);

        final HttpEntity<JsonNode> request = new HttpEntity<>(dsl, headers);
        LOGGER.info("Url to call {} ", getUrl() + RestApi.DSL_PATH);
        final ResponseEntity<JsonNode> response = restTemplate.exchange(getUrl() + RestApi.DSL_PATH, HttpMethod.POST,
            request, getJsonNodeClass());
        checkResponse(response);
        return response.getBody();
    }

    // TODO: Mutualize me in an abstract class ?
    private MultiValueMap<String, String> buildSearchHeaders(final ExternalHttpContext context) {
        final MultiValueMap<String, String> headers = buildHeaders(context);
        String accessContract = null;
        if (context instanceof ExternalHttpContext) {
            final ExternalHttpContext externalCallContext = context;
            accessContract = externalCallContext.getAccessContract();
        }

        if (accessContract != null) {
            headers.put(CommonConstants.X_ACCESS_CONTRACT_ID_HEADER, Collections.singletonList(accessContract));
        }
        return headers;
    }
}
