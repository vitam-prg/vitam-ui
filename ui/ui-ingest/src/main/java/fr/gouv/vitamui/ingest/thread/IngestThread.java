package fr.gouv.vitamui.ingest.thread;

import fr.gouv.vitamui.commons.api.CommonConstants;
import fr.gouv.vitamui.commons.api.logger.VitamUILogger;
import fr.gouv.vitamui.commons.api.logger.VitamUILoggerFactory;
import fr.gouv.vitamui.commons.rest.client.ExternalHttpContext;
import fr.gouv.vitamui.ingest.external.client.IngestExternalWebClient;
import fr.gouv.vitamui.ingest.service.IngestService;
import org.springframework.web.reactive.function.client.ClientResponse;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * Thread that send the uploaded stream to vitamui ingest-external through it's client
 */
public class IngestThread extends Thread {

    static final VitamUILogger LOGGER = VitamUILoggerFactory.getInstance(IngestService.class);

    private final IngestExternalWebClient client;

    private final ExternalHttpContext context;

    private final String originalFilename;

    private final String contextId;
    private final String action;
    private final InputStream in;

    public IngestThread(final IngestExternalWebClient client, final ExternalHttpContext context, InputStream in,
        final String contextId, final String action, final String originalFilename) {
        this.client = client;
        this.originalFilename = originalFilename;
        this.context = context;
        this.contextId = contextId;
        this.action = action;
        this.in = in;
    }


    @Override
    public void run() {
        ClientResponse response = null;
        try {
            response = client.upload(context, in, contextId, action, originalFilename);
            if (!response.statusCode().is2xxSuccessful()) {
                LOGGER.debug("Upload of [{}] failed. StatusCode : [{}] .", originalFilename,
                    response.statusCode());
                deleteTempFiles();
            }

            if (response.statusCode().is2xxSuccessful()) {
                LOGGER.debug("Upload of [{}] succeeded with StatusCode : [{}].", originalFilename,
                    response.statusCode());
                deleteTempFiles();
            }
        } catch (final Exception e) {
            LOGGER.debug("ERROR : Upload of [{}] failed.\n [{}]", originalFilename, e.getMessage());
        }
    }

    private void deleteTempFiles() {
        try {
            LOGGER.info("Try to delete temp file {} ", originalFilename);
            Files.deleteIfExists(
                Paths.get(System.getProperty(CommonConstants.VITAMUI_TEMP_DIRECTORY), context.getRequestId()));
            Files.deleteIfExists(
                Paths.get(System.getProperty(CommonConstants.VITAMUI_TEMP_DIRECTORY),
                    "int-" + context.getRequestId()));
            Files.deleteIfExists(
                Paths.get(System.getProperty(CommonConstants.VITAMUI_TEMP_DIRECTORY),
                    "ext-" + context.getRequestId()));
        } catch (IOException e) {
            LOGGER.error("Error deleting temp file {} error {} ", originalFilename, e.getMessage());
        }
    }

}
