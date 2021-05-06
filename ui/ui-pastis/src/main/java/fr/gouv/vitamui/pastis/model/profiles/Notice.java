package fr.gouv.vitamui.pastis.model.profiles;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class Notice {

    String _id;
    String identifier;
    String name;
    String description;
    String status;
    String creationDate;
    String lastUpdate;
    String activationDate;
    String deactivationDate;
    String controlSchema;
    String _tenant;
    String _v;
    List<String> fields;

    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    @JsonProperty("Identifier")
    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    @JsonProperty("Name")
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @JsonProperty("Description")
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @JsonProperty("Status")
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @JsonProperty("CreationDate")
    public String getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(String creationDate) {
        this.creationDate = creationDate;
    }

    @JsonProperty("LastUpdate")
    public String getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(String lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    @JsonProperty("ActivationDate")
    public String getActivationDate() {
        return activationDate;
    }

    public void setActivationDate(String activationDate) {
        this.activationDate = activationDate;
    }

    @JsonProperty("DeactivationDate")
    public String getDeactivationDate() {
        return deactivationDate;
    }

    public void setDeactivationDate(String deactivationDate) {
        this.deactivationDate = deactivationDate;
    }

    @JsonProperty("ControlSchema")
    public String getControlSchema() {
        return controlSchema;
    }

    public void setControlSchema(String controlSchema) {
        this.controlSchema = controlSchema;
    }

    public String get_tenant() {
        return _tenant;
    }

    public void set_tenant(String _tenant) {
        this._tenant = _tenant;
    }

    public String get_v() {
        return _v;
    }

    public void set_v(String _v) {
        this._v = _v;
    }

    @JsonProperty("Fields")
    public List<String> getFields() {
        return fields;
    }

    public void setFields(List<String> fields) {
        this.fields = fields;
    }
}
