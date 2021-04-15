package fr.gouv.vitamui.pastis.model.profiles;

import java.sql.Timestamp;
import java.util.Random;

public class PastisProfile {

    String type;
    Long id;
    String fileName;
    String baseName;
    String status;
    String lastModified;

    public PastisProfile(String fileName,String status, Long lastModified) {
        this.type = this.getFileType(fileName);
        this.id = Math.abs(new Random().nextLong()) / 1000;
        this.fileName = fileName;
        this.baseName = getFileBaseName(fileName);
        this.status = status;
        this.lastModified = new Timestamp(lastModified).toString();
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getBaseName() {
        return baseName;
    }

    public void setBaseName(String baseName) {
        this.baseName = baseName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLastModified() {
        return lastModified;
    }

    public void setLastModified(String lastModified) {
        this.lastModified = lastModified;
    }

    private String getFileType(String fileName){
        String[] tokens = fileName.split("\\.(?=[^\\.]+$)");
        return tokens[1].equals("rng") ? "PA" : "PUA";
    }

    private String getFileBaseName(String fileName){
        String[] tokens = fileName.split("\\.(?=[^\\.]+$)");
        return tokens[0];
    }


}

