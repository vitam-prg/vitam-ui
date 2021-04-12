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

public class OntologyDSL {

	public OntologyDSL() {
	}
	
	public String contrat_acces;
	public String dsl_request;
	public String query;
	public String and;
	public String eq;
	public String filter;
	public int limit;
	public String projection;
	public String tenant_id;
	
	
	public String getContrat_acces() {
		return contrat_acces;
	}
	public void setContrat_acces(String contrat_acces) {
		this.contrat_acces = contrat_acces;
	}
	public String getDsl_request() {
		return dsl_request;
	}
	public void setDsl_request(String dsl_request) {
		this.dsl_request = dsl_request;
	}
	public String getQuery() {
		return query;
	}
	public void setQuery(String query) {
		this.query = query;
	}
	public String getAnd() {
		return and;
	}
	public void setAnd(String and) {
		this.and = and;
	}
	public String getEq() {
		return eq;
	}
	public void setEq(String eq) {
		this.eq = eq;
	}
	public String getFilter() {
		return filter;
	}
	public void setFilter(String filter) {
		this.filter = filter;
	}
	public int getLimit() {
		return limit;
	}
	public void setLimit(int limit) {
		this.limit = limit;
	}
	public String getProjection() {
		return projection;
	}
	public void setProjection(String projection) {
		this.projection = projection;
	}
	public String getTenant_id() {
		return tenant_id;
	}
	public void setTenant_id(String tenant_id) {
		this.tenant_id = tenant_id;
	}

	public String toString() {
		return "{\r\n" +
				"  \"contrat_acces\": \"CINES-1\",\r\n" +
				"  \"dsl_request\": {\r\n" +
				"		\"$query\": {\r\n" +
				"			\"$and\": [\r\n" +
				"				{\r\n" +
				"					\"$eq\": {\r\n" +
				"						\"SedaField\": \"DocumentType +\"\r\n" +
				"					}\r\n" +
				"				}\r\n" +
				"			]\r\n" +
				"		},\r\n" +
				"		\"$filter\": {\r\n" +
				"			\"$limit\": 1\r\n" +
				"		},\r\n" +
				"		\"$projection\": {}\r\n" +
				"  },\r\n" +
				"  \"tenant_id\": \"1\"\r\n" +
				"}";
	}

}
