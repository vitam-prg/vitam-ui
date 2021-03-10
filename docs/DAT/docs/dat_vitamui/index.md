### Index du Dossier d'Architecture Technique

1. [Introduction](introduction/intro_objectifs.md)  
    1.1. [Structure du document](introduction/intro_objectifs.md#structure-du-document)  
    1.2. [Objectifs de la solution](introduction/intro_objectifs.md#objectifs-de-la-solution)  
    1.3. [Contributions et licences](introduction/intro_objectifs.md#contributions-et-licences)  
    
2. [Orientations techniques](orientations/orientations_techniques.md)  
    2.1. [Composants open-source](orientations/orientations_techniques.md#composants-open-source)  
    2.2. [Architecture micro-service](orientations/orientations_techniques.md#architecture-micro-service)  
    2.3. [Protocole REST](orientations/orientations_techniques.md#protocole-rest)  
    2.4. [Sécurité](orientations/orientations_techniques.md#scurit)  
    2.5. [Exploitation](orientations/orientations_techniques.md#exploitation)  
    2.6. [Déploiement](orientations/orientations_techniques.md#dploiement)  
    2.7. [Continuité de service](orientations/orientations_techniques.md#continuit-de-service) 

3. [Architecture](architecture/architecture.md)  
    3.1. [Applications Web](architecture/applications_front.md)  

    3.2. [Services externes](architecture/services_externes.md)  
        3.2.1. [Service identity-external](architecture/services_externes.md#service-identity-external)  
        3.2.2. [Service cas-external](architecture/services_externes.md#service-cas-external)  

    3.3. [Services internes](architecture/services_internes.md)  
        3.3.1. [Service identity-internal](architecture/services_internes.md#service-identity-internal)  
        3.3.2. [Service security-internal](architecture/services_internes.md#service-security-internal)  

    3.3. [Services d’infrastructure](architecture/services_infrastructures.md)  
    
    3.2. [Service d'archivage](architecture/service_archivage.md)  
    
    3.4. [Service d'authentification](architecture/service_authentification.md)  
        3.4.1. [Authentification des applications externes](architecture/service_authentification.md#authentification-des-applications-externes)  
        3.4.2. [Authentification des utilisateurs externes](architecture/service_authentification.md#authentification-des-utilisateurs-externes)  
        3.4.3. [Service d'authentification centralisé CAS](architecture/service_authentification.md#service-dauthentification-centralis-cas)  
        3.4.4. [Intégration CAS dans VITAMUI](architecture/service_authentification.md#intgration-cas-dans-vitamui)  
        3.4.5. [Authentification d'un utilisateur non authentifié](architecture/service_authentification.md#authentification-dun-utilisateur-non-authentifi)  
        3.4.6. [Authentification d'un utilisateur préalablement authentifié](architecture/service_authentification.md#authentification-dun-utilisateur-pralablement-authentifi)  
        3.4.7. [Délégation d'authentification](architecture/service_authentification.md#dlgation-dauthentification)  
        3.4.8. [Sécurisation de CAS](architecture/service_authentification.md#scurisation-de-cas)  
        3.4.9. [Activation de la sécurité](architecture/service_authentification.md#activation-de-la-scurit)  
        3.4.10. [Définition des services supportés](architecture/service_authentification.md#dfinition-des-services-supports)  
        3.4.11. [Configuration Hazelcast](architecture/service_authentification.md#configuration-hazelcast)  
        3.4.12. [Fonctionnalités](architecture/service_authentification.md#fonctionnalits)  

    3.6. [Sessions applicatives](architecture/sessions_applicatives.md#sessions-applicatives)  
        3.6.1. [Liste des sessions](architecture/sessions_applicatives.md#liste-des-sessions)  
        3.6.1. [Séquence de création des sessions](architecture/sessions_applicatives.md#squence-de-cration-des-sessions)  
        3.6.1. [Session applicative Web](architecture/sessions_applicatives.md#sessions-applicatives)  
        3.6.1. [Session des services API](architecture/sessions_applicatives.md#session-des-services-api)  
        3.6.1. [Session CAS](architecture/sessions_applicatives.md#session-cas)  
        3.6.1. [Session des IDP](architecture/sessions_applicatives.md#session-des-idp)  
        3.6.1. [Expiration et cloture des sessions](architecture/sessions_applicatives.md#expiration-et-cloture-des-sessions)  
        3.6.1. [Paramétrages des sessions](architecture/sessions_applicatives.md#paramtrages-des-sessions)  

    3.9. [Profils et rôles](architecture/profils_roles.md)  
        3.9.1. [Groupe de profils](architecture/profils_roles.md#groupe-de-profils)  
        3.9.2. [Profils](architecture/profils_roles.md#profils)  
        3.9.3. [Rôles](architecture/profils_roles.md#rles)  
        3.9.4. [Niveaux](architecture/profils_roles.md#niveaux)  
        3.9.5. [Matrice des droits](architecture/profils_roles.md#matrice-des-droits)  
        3.9.6. [Sécurisation des ressources](architecture/profils_roles.md#scurisation-des-ressources)  

    3.10. [Journalisation](architecture/journalisation.md)  

    3.11. [Modèle de données](architecture/mdd.md)  
        3.11.1 [Liste des bases](architecture/mdd.md#liste-des-bases)  
        3.11.2 [Base IAM](architecture/mdd.md#base-iam)  
        3.11.3 [Base Security](architecture/mdd.md#base-security)  
        3.11.4 [Base CAS](architecture/mdd.md#base-cas)  

4. [Implémentation](implementation/composants.md)

    4.1. [Technologies](implementation/composants.md#technologies)  
        4.1.1. [Briques techniques](implementation/composants.md#briques-techniques)  
        4.1.2. [COTS](implementation/composants.md#cots)  

    4.2. [Services](implementation/services.md#services)  
        4.3.1. [Architecture micro-services](implementation/services.md#services)  
        4.3.2. [Identification des services](implementation/services.md#identification-des-services)  
        4.3.3. [Communications inter-services](implementation/services.md#communications-inter-services)  
        4.3.4. [Cloisonnement des services](implementation/services.md#cloisonnement-des-services)  

    4.3. [Intégration système](implementation/integration.md)  
        4.3.4. [Utilisateurs et groupes d’exécution](implementation/integration.md#utilisateurs-et-groupes-dexcution)  
            4.3.4.1. [Utilisateurs](implementation/integration.md#utilisateurs)  
            4.3.4.2. [Groupes](implementation/integration.md#groupes)  
        4.3.4. [Arborescence de fichiers](implementation/integration.md#arborescence-de-fichiers)  
        4.3.4. [Intégration au service d'initialisation Systemd](implementation/integration.md#intgration-au-service-dinitialisation-systemd)  

    4.4. [Sécurisation](implementation/securisation.md#scurisation)  
        4.3.5. [Sécurisation des accès aux services externes](implementation/securisation.md#scurisation-des-accs-externes)  
        4.3.6. [Sécurisation des communications internes](implementation/securisation.md#scurisation-des-communications-internes)  
        4.3.7. [Sécurisation des accès aux bases de données](implementation/securisation.md#scurisation-des-accs-aux-bases-de-donnes)  
        4.3.7. [Sécurisation des secrets de déploiement](implementation/securisation.md#scurisation-des-secrets-de-dploiement)  
        4.3.7. [Liste des secrets](implementation/securisation.md#liste-des-secrets)  
        4.3.4. [Authentification du compte SSH](implementation/securisation.md#authentification-du-compte-ssh)  
        4.3.4. [Authentification des hôtes](implementation/securisation.md#authentification-des-htes)  
        4.3.4. [Elévation de privilèges](implementation/securisation.md#elvation-de-privilges)  

    4.5. [Certificats et PKI](implementation/pki.md)  
        4.5.1. [Principes de fonctionnement PKI de VITAMUI](implementation/pki.md#principes-de-fonctionnement-pki-de-vitamui)  
        4.5.2. [PKI de test](implementation/pki.md#pki-de-test)  
        4.5.3. [Liste des certificats utilisés](implementation/pki.md#liste-des-certificats-utiliss)  
        4.5.4. [Génération des certificats](implementation/pki.md#gnration-des-certificats)  
        4.5.5. [Configuration du client VITAMUI vers VITAM](implementation/pki.md#configuration-du-client-vitamui-vers-vitam)  
        4.5.6. [Génération des stores](implementation/pki.md#gnration-des-stores)  
        4.5.7. [Procédure d’ajout d’un certificat client externe](implementation/pki.md#procdure-dajout-dun-certificat-client-externe)  

    4.7. [Clusterisation](implementation/clusterisation.md)
   
    4.8. [Détail des services](implementation/detail_services.md)

    4.9. [Détail des COTS](implementation/detail_cots.md)   

5. [Gestion du système](exploitation/chaine_deploiement.md#exploitation)  
    5.1. [Chaîne de déploiement](exploitation/chaine_deploiement.md#chane-de-dploiement)  
    5.2. [Cloisonnement](exploitation/chaine_deploiement.md#cloisonnement)  
    5.3. [Supervision](exploitation/chaine_deploiement.md#supervision)  
    5.4. [Métriques](exploitation/chaine_deploiement.md#mtriques)  
    5.5. [Logs techniques](exploitation/chaine_deploiement.md#logs-techniques)  
    5.6. [Sauvegarde](exploitation/chaine_deploiement.md#sauvegarde)  
    5.7. [PRA](exploitation/chaine_deploiement.md#pra)  