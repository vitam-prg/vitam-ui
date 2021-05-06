/*
Copyright © CINES - Centre Informatique National pour l'Enseignement Supérieur (2020) 

[dad@cines.fr]

This software is a computer program whose purpose is to provide 
a web application to create, edit, import and export archive 
profiles based on the french SEDA standard
(https://redirect.francearchives.fr/seda/).


This software is governed by the CeCILL-C  license under French law and
abiding by the rules of distribution of free software.  You can  use, 
modify and/ or redistribute the software under the terms of the CeCILL-C
license as circulated by CEA, CNRS and INRIA at the following URL
"http://www.cecill.info". 

As a counterpart to the access to the source code and  rights to copy,
modify and redistribute granted by the license, users are provided only
with a limited warranty  and the software's author,  the holder of the
economic rights,  and the successive licensors  have only  limited
liability. 

In this respect, the user's attention is drawn to the risks associated
with loading,  using,  modifying and/or developing or reproducing the
software by the user in light of its specific status of free software,
that may mean  that it is complicated to manipulate,  and  that  also
therefore means  that it is reserved for developers  and  experienced
professionals having in-depth computer knowledge. Users are therefore
encouraged to load and test the software's suitability as regards their
requirements in conditions enabling the security of their systems and/or 
data to be ensured and,  more generally, to use and operate it in the 
same conditions as regards security. 

The fact that you are presently reading this means that you have had
knowledge of the CeCILL-C license and that you accept its terms.
*/

package fr.gouv.vitamui.pastis.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.gouv.vitamui.pastis.model.ElementProperties;
import fr.gouv.vitamui.pastis.model.jaxb.*;
import fr.gouv.vitamui.pastis.model.profiles.PastisProfile;
import fr.gouv.vitamui.pastis.model.profiles.Notice;
import fr.gouv.vitamui.pastis.model.profiles.ProfileNotice;
import fr.gouv.vitamui.pastis.util.pua.JsonFromPUA;
import fr.gouv.vitamui.pastis.util.PastisCustomCharacterEscapeHandler;
import fr.gouv.vitamui.pastis.util.PastisGetXmlJsonTree;
import fr.gouv.vitamui.pastis.util.PastisSAX2Handler;
import fr.gouv.vitamui.pastis.util.PuaPastisValidator;
import fr.gouv.vitamui.pastis.util.pua.NoticeFromPUA;
import fr.gouv.vitamui.pastis.util.pua.PuaFromJSON;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.io.support.ResourcePatternUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.XMLReaderFactory;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import java.io.*;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@RestController
class ProfileController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProfileController.class);

    private static final String APPLICATION_JSON_UTF8 = "application/json; charset=utf-8";

    @Value("${rng.base.file}")
    private String rngFile;

    private final ResourceLoader resourceLoader;

    @Autowired
    private PuaPastisValidator puaPastisValidator;

    @Autowired
    private JsonFromPUA jsonFromPUA;

    @Autowired
    private NoticeFromPUA noticeFromPUA;

    @Autowired
    private PuaFromJSON puaFromJSON;

    @Autowired
    public ProfileController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    private List<PastisProfile> pastisProfiles = new ArrayList<>();


    @RequestMapping(value = "/test", method = RequestMethod.GET)
    String test() {
        return "Pastis API is listening...";
    }

    @RequestMapping(value = "/getarchiveprofile", method = RequestMethod.POST, consumes = APPLICATION_JSON_UTF8, produces = MediaType.APPLICATION_XML_VALUE)
    String getArchiveProfile(@RequestBody final ElementProperties json) throws IOException  {

        // Recover a statically generated BaliseXML by buildBaliseXMLTree
        json.initTree(json);
        BaliseXML.buildBaliseXMLTree(json,0, null);
        // Add Recip struct to xml balises tree
        BaliseXML.addRecipTags();
        BaliseXML eparentRng  = BaliseXML.baliseXMLStatic;
        String response = null;
        Writer writer = null;
        try {
            JAXBContext contextObj = JAXBContext.newInstance(AttributeXML.class, ElementXML.class, DataXML.class,
                    ValueXML.class, OptionalXML.class, OneOrMoreXML.class,
                    ZeroOrMoreXML.class, AnnotationXML.class, DocumentationXML.class,
                    StartXML.class, GrammarXML.class,ChoiceXml.class,AnyNameXML.class,ExceptXML.class,NsNameXML.class);
            Marshaller marshallerObj = contextObj.createMarshaller();
            marshallerObj.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            marshallerObj.setProperty("com.sun.xml.bind.marshaller.CharacterEscapeHandler",
                    new PastisCustomCharacterEscapeHandler());

            ByteArrayOutputStream os = new ByteArrayOutputStream();
            writer = new OutputStreamWriter(os, "UTF-8");

            marshallerObj.marshal(eparentRng, writer);
            response = new String (os.toByteArray(), "UTF-8");

        } catch (IOException e1) {
            e1.printStackTrace();
        } catch (JAXBException e1) {
            e1.printStackTrace();
        }
        finally {
            writer.close();
        }

        LOGGER.info("RNG profile generated successfully");
        return response;
    }

    @RequestMapping(value = "/getarchiveunitprofile", method = RequestMethod.POST, consumes = APPLICATION_JSON_UTF8, produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<String> getArchiveUnitProfile(@RequestBody final ProfileNotice json) throws IOException  {

        Notice notice = new Notice();
        if(json.getNotice() != null){
            notice = json.getNotice();
        }else { notice.set_id("12133411121213"); }

        String controlSchema = puaFromJSON.getControlSchemaFromElementProperties(json.getElementProperties());
        notice.setControlSchema(controlSchema);

        ObjectMapper objectMapper = new ObjectMapper();
        String noticeAsString = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(notice);

        return ResponseEntity.ok(noticeAsString);

    }

    @RequestMapping (value = "/getfile", method = RequestMethod.GET, produces = "text/plain")
    ResponseEntity<String> getFile() {

        InputStream rngFile = getClass().getClassLoader().getResourceAsStream("profile3.rng");
        if (rngFile != null) {
            return new ResponseEntity<>(rngFile.toString(), HttpStatus.OK);
        }	else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @RequestMapping (value = "/createprofile", method = RequestMethod.GET)
    ResponseEntity<String> createprofile() throws URISyntaxException {
        PastisSAX2Handler handler = new PastisSAX2Handler();
        PastisGetXmlJsonTree getJson = new PastisGetXmlJsonTree();

        try {
            XMLReader xmlReader = XMLReaderFactory.createXMLReader();
            xmlReader.setContentHandler(handler);

            LOGGER.info("Starting rng edition profile with base file : {}", this.rngFile);

            InputStream inputStream = getClass().getClassLoader().getResourceAsStream(this.rngFile);
            InputSource inputSource = new InputSource(inputStream);

            xmlReader.parse(inputSource);

        } catch (SAXException | IOException e  ) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return ResponseEntity.ok(getJson.getJsonParsedTree(handler.elementRNGRoot));
    }

    @RequestMapping (value = "/edit", method = RequestMethod.POST)
    ResponseEntity<String> loadProfile(@RequestParam(name = "id") String id) throws JsonProcessingException {
        PastisSAX2Handler handler = new PastisSAX2Handler();
        PastisGetXmlJsonTree getJson = new PastisGetXmlJsonTree();
        PastisProfile profileToEdit;
        String notice = null;
        String parsedProfile = null;
        ObjectMapper mapper = new ObjectMapper();
        try {
            profileToEdit = pastisProfiles.stream()
                    .filter(p -> Long.toString(p.getId()).equals(id))
                    .collect(Collectors.toList()).get(0);

            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("rng/" +
                    profileToEdit.getFileName());
            InputSource inputSource = new InputSource(inputStream);

            if (profileToEdit.getType().equals("PA")) {
                XMLReader xmlReader = XMLReaderFactory.createXMLReader();
                xmlReader.setContentHandler(handler);
                xmlReader.parse(inputSource);
                parsedProfile = getJson.getJsonParsedTree(handler.elementRNGRoot);
                LOGGER.info("Starting editing Archive Profile with id : {}", id);
            } else if (profileToEdit.getType().equals("PUA")) {
                JSONTokener tokener = new JSONTokener(new InputStreamReader(inputStream));
                JSONObject profileJson = new JSONObject(tokener);
                puaPastisValidator.validatePUA(profileJson);
                ElementProperties profile = jsonFromPUA.getProfileFromPUA(profileJson);
                parsedProfile = "[" + mapper.writeValueAsString(profile) + "]";
                Notice noticeObject = noticeFromPUA.getNoticeFromPUA(profileJson);
                notice = mapper.writeValueAsString(noticeObject);
                LOGGER.info("Starting editing Archive Unit Profile with id : {}", id);
            }
        } catch (SAXException | IOException e  ) {
            LOGGER.error("Failed to load profile with id : {}", id);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (AssertionError ae) {
            LOGGER.error("Failed to load pua with id {} and error message {}", id, ae.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        JSONObject response = new JSONObject();
        response.put("id", profileToEdit.getId());
        response.put("profile", parsedProfile);
        response.put("notice", notice);

        return ResponseEntity.ok(response.toString());
    }


    @RequestMapping (value = "/new", method = RequestMethod.POST,
            consumes = "multipart/form-data", produces = "application/json")
    ResponseEntity<String> loadProfileFromFile(@RequestParam MultipartFile file) {
        PastisSAX2Handler handler = new PastisSAX2Handler();
        PastisGetXmlJsonTree getJson = new PastisGetXmlJsonTree();
        PastisProfile profileToEdit;
        String notice = null;
        String parsedProfile = null;
        ObjectMapper mapper = new ObjectMapper();

        try {
            String fileExtension = file.getOriginalFilename().split("\\.")[1];
            InputStream fileInputStream = file.getInputStream();
            InputSource inputSource = new InputSource(file.getInputStream());

            if (fileExtension.equals("rng")) {
                XMLReader xmlReader = XMLReaderFactory.createXMLReader();
                xmlReader.setContentHandler(handler);
                xmlReader.parse(inputSource);
                parsedProfile = getJson.getJsonParsedTree(handler.elementRNGRoot);
                LOGGER.info("Starting editing Archive Profile from file : {}",file.getOriginalFilename());

            } else if (fileExtension.equals("json")) {
                JSONTokener tokener = new JSONTokener(new InputStreamReader(fileInputStream));
                JSONObject profileJson = new JSONObject(tokener);
                puaPastisValidator.validatePUA(profileJson);
                ElementProperties profile = jsonFromPUA.getProfileFromPUA(profileJson);
                parsedProfile = "[" + mapper.writeValueAsString(profile) + "]";
                Notice noticeObject = noticeFromPUA.getNoticeFromPUA(profileJson);
                notice = mapper.writeValueAsString(noticeObject);
                LOGGER.info("Starting editing Archive Unit Profile with name : {}", file.getOriginalFilename());
            }

        } catch (SAXException | IOException e  ) {
            LOGGER.error("Failed to load profile '{}' : " + e.getMessage(), file.getOriginalFilename());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (AssertionError ae) {
            LOGGER.error("Failed to load pua : {}", ae.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }

        JSONObject response = new JSONObject();
        response.put("id", Math.abs(new Random().nextLong()) / 1000);
        response.put("profile", parsedProfile);
        response.put("notice", notice);

        return ResponseEntity.ok(response.toString());
    }


    @RequestMapping (value = "/createprofilefromfile",
            method = RequestMethod.POST,consumes = "multipart/form-data",
            produces = "application/json")
    ResponseEntity<String> createprofilefromfile(@RequestParam MultipartFile file )  {

        PastisSAX2Handler handler = new PastisSAX2Handler();
        PastisGetXmlJsonTree getJson = new PastisGetXmlJsonTree();

        try {
            XMLReader xmlReader = XMLReaderFactory.createXMLReader();
            xmlReader.setContentHandler(handler);
            xmlReader.parse(new InputSource(file.getInputStream()));
        } catch (IOException e) {
            return new ResponseEntity<>("Error while processing file : ", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (SAXException e) {
            if (e instanceof SAXParseException) {
                return new ResponseEntity<>("Erreur lors du chargement du profil, ligne " + ((SAXParseException) e).getLineNumber() + " colonne " + ((SAXParseException) e).getColumnNumber() + ": " + e.getMessage() , HttpStatus.INTERNAL_SERVER_ERROR);
            } else {
                return new ResponseEntity<>("Error while processing file : ", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return ResponseEntity.ok(getJson.getJsonParsedTree(handler.elementRNGRoot));
    }

    @RequestMapping (value = "/getprofiles", method = RequestMethod.GET)
    ResponseEntity<List<PastisProfile>> getFiles() throws IOException {
        Resource[] resources = ResourcePatternUtils
                .getResourcePatternResolver(resourceLoader)
                .getResources("classpath*:rng/*.*");

        try {
            if (pastisProfiles.isEmpty()) {
                for (Resource r : resources) {
                    pastisProfiles.add(new PastisProfile(r.getFilename(), "active", r.lastModified()));
                }
            }
            return ResponseEntity.ok(pastisProfiles);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
