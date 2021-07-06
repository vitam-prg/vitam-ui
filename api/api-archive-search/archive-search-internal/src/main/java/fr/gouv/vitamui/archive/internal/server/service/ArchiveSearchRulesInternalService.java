/*
 * Copyright French Prime minister Office/SGMAP/DINSIC/Vitam Program (2015-2020)
 * contact.vitam@culture.gouv.fr
 *
 * This software is a computer program whose purpose is to implement a digital archiving back-office system managing
 * high volumetry securely and efficiently.
 *
 * This software is governed by the CeCILL 2.1 license under French law and abiding by the rules of distribution of free
 * software. You can use, modify and/ or redistribute the software under the terms of the CeCILL 2.1 license as
 * circulated by CEA, CNRS and INRIA at the following URL "http://www.cecill.info".
 *
 * As a counterpart to the access to the source code and rights to copy, modify and redistribute granted by the license,
 * users are provided only with a limited warranty and the software's author, the holder of the economic rights, and the
 * successive licensors have only limited liability.
 *
 * In this respect, the user's attention is drawn to the risks associated with loading, using, modifying and/or
 * developing or reproducing the software by the user in light of its specific status of free software, that may mean
 * that it is complicated to manipulate, and that also therefore means that it is reserved for developers and
 * experienced professionals having in-depth computer knowledge. Users are therefore encouraged to load and test the
 * software's suitability as regards their requirements in conditions enabling the security of their systems and/or data
 * to be ensured and, more generally, to use and operate it in the same conditions as regards security.
 *
 * The fact that you are presently reading this means that you have had knowledge of the CeCILL 2.1 license and that you
 * accept its terms.
 */

package fr.gouv.vitamui.archive.internal.server.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.gouv.vitam.common.client.VitamContext;
import fr.gouv.vitam.common.database.builder.request.exception.InvalidCreateOperationException;
import fr.gouv.vitam.common.exception.InvalidParseOperationException;
import fr.gouv.vitam.common.exception.VitamClientException;
import fr.gouv.vitam.common.model.RequestResponse;
import fr.gouv.vitam.common.model.administration.FileRulesModel;
import fr.gouv.vitamui.archives.search.common.dsl.VitamQueryHelper;
import fr.gouv.vitamui.archives.search.common.dto.ArchiveUnit;
import fr.gouv.vitamui.archives.search.common.dto.SearchCriteriaDto;
import fr.gouv.vitamui.archives.search.common.dto.SearchCriteriaEltDto;
import fr.gouv.vitamui.commons.api.domain.AgencyModelDto;
import fr.gouv.vitamui.commons.api.exception.BadRequestException;
import fr.gouv.vitamui.commons.api.logger.VitamUILogger;
import fr.gouv.vitamui.commons.api.logger.VitamUILoggerFactory;
import fr.gouv.vitamui.commons.vitam.api.administration.RuleService;
import fr.gouv.vitamui.commons.vitam.api.dto.ResultsDto;
import fr.gouv.vitamui.commons.vitam.api.dto.RuleNodeResponseDto;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Archive-Search rules service for archives unit .
 */
@Service
public class ArchiveSearchRulesInternalService {
    private static final VitamUILogger LOGGER =
        VitamUILoggerFactory.getInstance(ArchiveSearchRulesInternalService.class);
    public static final String RULE_NAME_FIELD = "RuleValue";
    public static final String RULE_TITLE_FIELD = "AppraisalRuleTitle";
    public static final String RULE_ID_FIELD = "RuleId";

    private final ObjectMapper objectMapper;
    final private RuleService ruleService;

    @Autowired
    public ArchiveSearchRulesInternalService(final ObjectMapper objectMapper, final RuleService ruleService) {
        this.objectMapper = objectMapper;
        this.ruleService = ruleService;
    }

    public void mapAppraisalRulesTitlesToCodes(SearchCriteriaDto searchQuery,
        VitamContext vitamContext)
        throws VitamClientException {
        LOGGER.debug("calling mapRulesTitlesToCodes  {} ", searchQuery.toString());
        Set<String> rulesTitleCriteria = new HashSet<>();
        searchQuery.getAppraisalMgtRulesCriteriaList().stream()
            .filter(criteriaElt -> criteriaElt.getCriteria().equals(RULE_TITLE_FIELD)).forEach(
            criteriaElt -> rulesTitleCriteria.addAll(criteriaElt.getValues()));
        if (!rulesTitleCriteria.isEmpty()) {
            List<FileRulesModel> mgtRules = findRulesByNames(vitamContext, rulesTitleCriteria, "AppraisalRule");
            mapRulesToRulesIdInCriteria(searchQuery, mgtRules, "AppraisalRule");
        }
    }

    /**
     * fill archive unit by adding originResponse
     *
     * @param originResponse
     * @param actualAgenciesMapById
     * @return
     */
    public ArchiveUnit fillOriginatingAgencyName(ResultsDto originResponse,
        Map<String, AgencyModelDto> actualAgenciesMapById) {
        ArchiveUnit archiveUnit = new ArchiveUnit();
        BeanUtils.copyProperties(originResponse, archiveUnit);
        if (actualAgenciesMapById != null && !actualAgenciesMapById.isEmpty()) {
            AgencyModelDto agencyModel = actualAgenciesMapById.get(originResponse.getOriginatingAgency());
            if (agencyModel != null) {
                archiveUnit.setOriginatingAgencyName(agencyModel.getName());
            }
        }
        return archiveUnit;
    }

    private void mapRulesToRulesIdInCriteria(SearchCriteriaDto searchQuery, List<FileRulesModel> actualRules,
        String fieldName) {
        if (searchQuery != null && searchQuery.getCriteriaList() != null && !searchQuery.getCriteriaList().isEmpty()) {
            List<String> rulesNamesList = searchQuery.getCriteriaList().stream()
                .filter(criteria -> "RuleValue".equals(criteria.getCriteria()))
                .map(criteria -> criteria.getValues()).flatMap(List::stream)
                .collect(Collectors.toList());

            if (!rulesNamesList.isEmpty()) {
                List<String> filteredRulesIds = actualRules.stream()
                    .filter(rule -> rulesNamesList.contains(rule.getRuleValue()))
                    .map(rule -> rule.getRuleId())
                    .collect(Collectors.toList());

                AtomicInteger i = new AtomicInteger();
                int indexOpt = searchQuery.getCriteriaList().stream().peek(v -> i.incrementAndGet())
                    .anyMatch(criteria -> fieldName.equals(criteria.getCriteria())) ?
                    i.get() - 1 : -1;
                SearchCriteriaEltDto ruleIdentifierCriteria;
                if (!filteredRulesIds.isEmpty() && indexOpt != -1) {
                    ruleIdentifierCriteria = searchQuery.getCriteriaList().get(indexOpt);
                    filteredRulesIds.addAll(ruleIdentifierCriteria.getValues());
                    ruleIdentifierCriteria.setValues(filteredRulesIds);
                    searchQuery.getCriteriaList().set(indexOpt, ruleIdentifierCriteria);
                } else {
                    ruleIdentifierCriteria = new SearchCriteriaEltDto();
                    ruleIdentifierCriteria.setCriteria(fieldName);
                    ruleIdentifierCriteria.setValues(filteredRulesIds);
                    searchQuery.getCriteriaList().add(ruleIdentifierCriteria);
                }
                searchQuery.setCriteriaList(searchQuery.getCriteriaList().stream()
                    .filter(criteria -> !"RuleValue".equals(criteria.getCriteria())).collect(
                        Collectors.toList()));
            }
        }
    }

    public List<FileRulesModel> findRulesByCriteria(VitamContext vitamContext, String field,
        List<String> rulesIdentifiers, String ruleType) throws VitamClientException {
        List<FileRulesModel> rules = new ArrayList<>();
        if (rulesIdentifiers != null && !rulesIdentifiers.isEmpty()) {
            LOGGER.info("Finding management rules by field {}  values {} ", field, rulesIdentifiers);
            Map<String, Object> searchCriteriaMap = new HashMap<>();
            searchCriteriaMap.put(field, rulesIdentifiers);
            if (ruleType != null) {
                searchCriteriaMap.put("RuleType", ruleType);
            }
            try {
                JsonNode queryRules = VitamQueryHelper
                    .createQueryDSL(searchCriteriaMap, 0, rulesIdentifiers.size(), Optional.empty(),
                        Optional.empty());
                RequestResponse<FileRulesModel> requestResponse =
                    ruleService.findRules(vitamContext, queryRules);
                rules = objectMapper.treeToValue(requestResponse.toJsonNode(), RuleNodeResponseDto.class).getResults();
            } catch (InvalidCreateOperationException e) {
                throw new VitamClientException("Unable to find the rules ", e);
            } catch (InvalidParseOperationException | JsonProcessingException e1) {
                throw new BadRequestException("Error parsing query ", e1);
            }
        }
        LOGGER.debug("management rules  found {} ", rules);
        return rules;
    }

    /**
     * Search origin agencies by theirs codes
     *
     * @param vitamContext
     * @param rulesIdentifiers
     * @return
     * @throws InvalidParseOperationException
     * @throws VitamClientException
     */
    public List<FileRulesModel> findRulesByIdentifiers(VitamContext vitamContext, Set<String> rulesIdentifiers,
        String ruleType)
        throws VitamClientException {
        List<String> rulesIdentifiersList = new ArrayList<>(rulesIdentifiers);
        return findRulesByCriteria(vitamContext, "RuleId", rulesIdentifiersList, ruleType);
    }

    /**
     * Search rules by their names
     *
     * @param vitamContext
     * @param rulesIdentifiers
     * @return
     * @throws InvalidParseOperationException
     * @throws VitamClientException
     */
    public List<FileRulesModel> findRulesByNames(VitamContext vitamContext, Set<String> rulesIdentifiers,
        String ruleType)
        throws VitamClientException {
        List<String> rulesIdentifiersList = new ArrayList<>(rulesIdentifiers);
        return findRulesByCriteria(vitamContext, "RuleValue", rulesIdentifiersList, ruleType);
    }
}
