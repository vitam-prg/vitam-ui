package fr.gouv.vitamui.pastis.model.seda;

import fr.gouv.vitamui.pastis.model.ElementProperties;

import java.util.List;
import java.util.stream.Stream;

public class SedaNode {
    private String Name;
    private String Element;
    private String Cardinality;
    private String Type;
    private String Choice;
    private String Extensible;
    private List<String> Enumeration;
    private String Definition;
    private String Collection;
    private List<SedaNode> Children;

    public String getName() {
        return Name;
    }

    public void setName(String name) {
        Name = name;
    }

    public String getElement() {
        return Element;
    }

    public void setElement(String element) {
        Element = element;
    }

    public String getCardinality() {
        return Cardinality;
    }

    public void setCardinality(String cardinality) {
        Cardinality = cardinality;
    }

    public String getType() {
        return Type;
    }

    public void setType(String type) {
        Type = type;
    }

    public String getChoice() {
        return Choice;
    }

    public void setChoice(String choice) {
        Choice = choice;
    }

    public String getExtensible() {
        return Extensible;
    }

    public void setExtensible(String extensible) {
        Extensible = extensible;
    }

    public List<String> getEnumeration() {
        return Enumeration;
    }

    public void setEnumeration(List<String> enumeration) {
        Enumeration = enumeration;
    }

    public String getDefinition() {
        return Definition;
    }

    public void setDefinition(String definition) {
        Definition = definition;
    }

    public String getCollection() {
        return Collection;
    }

    public void setCollection(String collection) {
        Collection = collection;
    }

    public List<SedaNode> getChildren() {
        return Children;
    }

    public void setChildren(List<SedaNode> children) {
        Children = children;
    }

    public Stream<SedaNode> flattened() {
        return Stream.concat(
                Stream.of(this),
                Children.stream().flatMap(SedaNode::flattened));
    }
}
