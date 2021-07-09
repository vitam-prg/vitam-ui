/**
 * Copyright French Prime minister Office/SGMAP/DINSIC/Vitam Program (2019-2020)
 * and the signatories of the "VITAM - Accord du Contributeur" agreement.
 *
 * contact@programmevitam.fr
 *
 * This software is a computer program whose purpose is to implement
 * implement a digital archiving front-office system for the secure and
 * efficient high volumetry VITAM solution.
 *
 * This software is governed by the CeCILL-C license under French law and
 * abiding by the rules of distribution of free software.  You can  use,
 * modify and/ or redistribute the software under the terms of the CeCILL-C
 * license as circulated by CEA, CNRS and INRIA at the following URL
 * "http://www.cecill.info".
 *
 * As a counterpart to the access to the source code and  rights to copy,
 * modify and redistribute granted by the license, users are provided only
 * with a limited warranty  and the software's author,  the holder of the
 * economic rights,  and the successive licensors  have only  limited
 * liability.
 *
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
 *
 * The fact that you are presently reading this means that you have had
 * knowledge of the CeCILL-C license and that you accept its terms.
 */
package fr.gouv.vitamui.referential.common.service;

import com.fasterxml.jackson.databind.JsonNode;
import fr.gouv.vitam.access.external.client.AccessExternalClient;
import fr.gouv.vitam.access.external.client.AdminExternalClient;
import fr.gouv.vitam.access.external.common.exception.AccessExternalClientNotFoundException;
import fr.gouv.vitam.access.external.common.exception.AccessExternalClientServerException;
import fr.gouv.vitam.common.client.VitamContext;
import fr.gouv.vitam.common.database.builder.request.exception.InvalidCreateOperationException;
import fr.gouv.vitam.common.database.builder.request.single.Select;
import fr.gouv.vitam.common.exception.InvalidParseOperationException;
import fr.gouv.vitam.common.exception.VitamClientException;
import fr.gouv.vitam.common.model.RequestResponse;
import fr.gouv.vitam.common.model.administration.AccessContractModel;
import fr.gouv.vitam.common.model.administration.AccessionRegisterDetailModel;
import fr.gouv.vitam.common.model.administration.AccessionRegisterSummaryModel;
import fr.gouv.vitamui.commons.api.logger.VitamUILogger;
import fr.gouv.vitamui.commons.api.logger.VitamUILoggerFactory;
import fr.gouv.vitamui.commons.vitam.api.util.VitamRestUtils;
import org.springframework.beans.factory.annotation.Autowired;

public class AccessionRegisterService {

    private static final VitamUILogger LOGGER = VitamUILoggerFactory.getInstance(AccessionRegisterService.class);

    private final AdminExternalClient adminExternalClient;

    @Autowired
    public AccessionRegisterService(final AdminExternalClient adminExternalClient) {
        this.adminExternalClient = adminExternalClient;
    }

    public RequestResponse<AccessionRegisterSummaryModel> findAccessionRegisterSummary(VitamContext context) throws VitamClientException, InvalidCreateOperationException, InvalidParseOperationException {
        LOGGER.debug("findAccessionRegisterSymbolic");
        LOGGER.info("Accession Register EvIdAppSession : {} " , context.getApplicationSessionId());
        return this.adminExternalClient.findAccessionRegister(context, new Select().getFinalSelect());
    }

    public RequestResponse<AccessionRegisterSummaryModel> findAccessionRegisterSummary(VitamContext context, JsonNode query) throws VitamClientException, InvalidCreateOperationException, InvalidParseOperationException {
        LOGGER.debug("findAccessionRegisterSummary by query projections");
        LOGGER.info("Accession Register Summary by projection query on wanted fields stats : {} " , context.getApplicationSessionId());
        return this.adminExternalClient.findAccessionRegister(context, query);
    }

    public RequestResponse getAccessionRegisterDetail(VitamContext context, String id)
        throws InvalidParseOperationException, AccessExternalClientServerException,
        AccessExternalClientNotFoundException {
        LOGGER.debug("findAccessionRegisterDetail");
        LOGGER.info("Accession Register EvIdAppSession : {} " , context.getApplicationSessionId());
        final RequestResponse accessionRegisterDetail =
            this.adminExternalClient.getAccessionRegisterDetail(context, id, new Select().getFinalSelect());
        JsonNode jsonNode =
            accessionRegisterDetail.toJsonNode();
        LOGGER.debug("jsonNode = {}", jsonNode);
        return accessionRegisterDetail;
    }

    public RequestResponse getAccessionRegisterDetails(final VitamContext vitamContext, final JsonNode select)
        throws AccessExternalClientNotFoundException, AccessExternalClientServerException,
        InvalidParseOperationException {
        final RequestResponse response = adminExternalClient.getAccessionRegisterDetail(vitamContext, "RATP", select);
        VitamRestUtils.checkResponse(response);
        return response;
    }

}
