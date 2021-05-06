package fr.gouv.vitamui.pastis.model;


import java.util.List;

public class PuaData {

    Boolean AdditionalProperties;
    List<String> Enum;
    String Pattern;
    Integer MinLenght;
    Integer MaxLenght;
    Integer Minimum;
    Integer Maximum;
    Boolean ExclusiveMinimum;
    Boolean ExclusiveMaximum;

    public Boolean getAdditionalProperties() {
        return AdditionalProperties;
    }

    public void setAdditionalProperties(Boolean additionalProperties) {
        AdditionalProperties = additionalProperties;
    }

    public List<String> getEnum() {
        return Enum;
    }

    public void setEnum(List<String> anEnum) {
        Enum = anEnum;
    }

    public String getPattern() {
        return Pattern;
    }

    public void setPattern(String pattern) {
        Pattern = pattern;
    }

    public Integer getMinLenght() {
        return MinLenght;
    }

    public void setMinLenght(Integer minLenght) {
        MinLenght = minLenght;
    }

    public Integer getMaxLenght() {
        return MaxLenght;
    }

    public void setMaxLenght(Integer maxLenght) {
        MaxLenght = maxLenght;
    }

    public Integer getMinimum() {
        return Minimum;
    }

    public void setMinimum(Integer minimum) {
        Minimum = minimum;
    }

    public Integer getMaximum() {
        return Maximum;
    }

    public void setMaximum(Integer maximum) {
        Maximum = maximum;
    }

    public Boolean getExclusiveMinimum() {
        return ExclusiveMinimum;
    }

    public void setExclusiveMinimum(Boolean exclusiveMinimum) {
        ExclusiveMinimum = exclusiveMinimum;
    }

    public Boolean getExclusiveMaximum() {
        return ExclusiveMaximum;
    }

    public void setExclusiveMaximum(Boolean exclusiveMaximum) {
        ExclusiveMaximum = exclusiveMaximum;
    }
}
