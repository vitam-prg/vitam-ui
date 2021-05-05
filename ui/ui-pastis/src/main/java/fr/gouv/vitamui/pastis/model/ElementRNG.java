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
package fr.gouv.vitamui.pastis.model;

import fr.gouv.vitamui.pastis.util.RNGConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

import static fr.gouv.vitamui.pastis.util.RNGConstants.TypesMap;

/**
 * @author Paulo Pimenta <pimenta@cines.fr>
 */
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class ElementRNG { 
    
    public ElementRNG() {
    }
    
    String name;

    String type;
    
    String dataType;   
    
    String value;
    
    ElementRNG parent;

    private static Logger LOGGER = LoggerFactory.getLogger(ElementRNG.class);


    public static ElementProperties elementStatic = new ElementProperties();
    
    public static ElementProperties elementStaticRoot = new ElementProperties();
    
    private static long idCounter = 0;
    
    List<ElementRNG> children = new ArrayList<ElementRNG>();    
    
    @XmlAttribute  
    public String getName() {
        return name;
    }

    public void setName(String name) {        
        this.name = name;
    }

    @XmlElement
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @XmlAttribute (name="type")
    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    @XmlElement(name="rng:value")
    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    @XmlTransient
    public ElementRNG getParent() {
        return parent;
    }

    public void setParent(ElementRNG parent) {
        this.parent = parent;
    }

    @XmlAnyElement
    public List<ElementRNG> getChildren() {
        return children;
    }

    public void setChildren(List<ElementRNG> children) {
        this.children = children;
    }   
    
    public static void setDataForParentElementOrAttribute (ElementProperties parentNode, ElementRNG node) {
        if(null != parentNode.getType() && (RNGConstants.MetadaDataType.element.toString().equals(parentNode.getType())
        		|| RNGConstants.MetadaDataType.attribute.toString().equals(parentNode.getType()))) {
            parentNode.setValueOrData(node.getType());
            if (TypesMap.containsKey(parentNode.getName())) {
                parentNode.setDataType(TypesMap.get(parentNode.getName()).getLabel());
            }
            parentNode.setValue(node.getValue());
        }else {
            setDataForParentElementOrAttribute(parentNode.getParent(), node);
        }
    }
    
    
    public static void setDocumentationForParentElement (ElementProperties parentNode, ElementRNG node) {
        if(null != parentNode.getType() && RNGConstants.MetadaDataType.element.toString().equals(parentNode.getType())) {
            parentNode.setDocumentation(node.getValue());
        }else {
        	setDocumentationForParentElement(parentNode.getParent(), node);
        }
    }
    
    public static void setElementsForGroupOrChoice(ElementProperties parentNode, ElementRNG node) {
        
    	if(null != parentNode.getType() && (RNGConstants.GroupOrChoice.group.toString().equals(parentNode.getType()) 
        		|| RNGConstants.GroupOrChoice.choice.toString().equals(parentNode.getType()))) {
            parentNode.setGroupOrChoice(node.getType());
        }else {
        	setElementsForGroupOrChoice(parentNode.getParent(), node);
        }
    }
    // Build the a tree of properties given :
    // a node
    //the level of the node 
    //the parent of the node
    public static ElementProperties buildElementPropertiesTree( ElementRNG node, int profondeur, ElementProperties parentNode ){
        ElementProperties local = new ElementProperties();
        LOGGER.info("Generating JSON element {}", node.getName());
        if(null != node.getType() && RNGConstants.MetadaDataType.element.toString().equals(node.getType())
        		|| RNGConstants.MetadaDataType.attribute.toString().equals(node.getType())) {
            
			local.setCardinality(elementStatic.getCardinality());
        	local.setGroupOrChoice(elementStatic.getGroupOrChoice());
            local.setName(node.getName());
            local.setType(node.getType());
            local.setLevel(profondeur);
            local.setValue(node.getValue());


            elementStatic = new ElementProperties();
        
            if(null != parentNode) {
                local.setParent(parentNode);
                local.setParentId(parentNode.getId());
                local.setId(ElementRNG.idCounter++);
                parentNode.getChildren().add(local);
            }else {
                local.setId(ElementRNG.idCounter++);
                local.setParentId(null);
                elementStaticRoot = local;
            }
        }
        
        else {

            if(RNGConstants.isValueOrData(node.getType())) {
                setDataForParentElementOrAttribute(parentNode, node);
            }else if(RNGConstants.isCardinality(node.getType())) {  
                elementStatic.setCardinality(node.getType());
            }else if(RNGConstants.hasGroupOrChoice(node.getType())) {  
                elementStatic.setGroupOrChoice(node.getType());
            }
            else if("documentation".equals(node.getType())) {
                if(null != node.getValue()) {
                    setDocumentationForParentElement(parentNode, node);
                }
            }

            local = parentNode;
        }
 
      for( ElementRNG next : node.getChildren() ) {
          if(null != next.getType() && (RNGConstants.MetadaDataType.element.toString().equals(next.getType())
        		  || RNGConstants.MetadaDataType.attribute.toString().equals(next.getType()))) {
              buildElementPropertiesTree( next, profondeur + 1, local );              
          }else {
              buildElementPropertiesTree( next, profondeur, local );
          }
      }
      return local;
    }
}
