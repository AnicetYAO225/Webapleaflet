// Etape 1 : Paramètre d'affichage de la carte : coordonnées à l'ouverture et le niveau de zoom
var map = L.map('map').setView([0.0, 20.0], 4,5);

//Etape 3 : Ajouter des fonds de carte
//Phase 1 : Fond de carte openstreetmap
var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)

//Ajout de deux autres fonds de carte 
//Phase 2 : Prendre une carte et mettre son code JS
var Stadia_AlidadeSatellite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
});

var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

//Phase 3 : Créer une basemap
var basemap = {
    'Openstreetmap': osm,
    'Stadia': Stadia_AlidadeSatellite,
    'Opentopo': OpenTopoMap
};

//Phase finale : Mettre de contrôle
L.control.layers(basemap).addTo(map)

//ATTENTION POUR LA SUITE DU TRAVAIL, L'ETAPE 5 DOIT ETRE AU DESSUS DE L'ETAPE 4


//Etape 5 : Passer à une carte chloropèthe
//Phase 1 : Créer la fonction qui affecte une couleur à la densité de population

function getColor(DENSIT_) {
    return DENSIT_ > 140 ? '#a63603' :
           DENSIT_ > 75  ? '#e6550d' :
           DENSIT_ > 50  ? '#fd8d3c' :
           DENSIT_ > 25  ? '#fdae6b' :
		   DENSIT_ > 5   ? '#fdd0a2' :
                           '#feedde';
}



//Phase 2 : Définir une fonction de style pour notre couche GeoJSON afin que sa couleur de fond (fillcolor) 
	//dépende de la valeur de densité(feature.properties.densitypropriété), tout ajustant également l'apparence.

function style(feature) {
	return {
		fillColor: getColor(feature.properties.DENSIT_),
		weight: 1,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.95
	};
}

//Phase 3 (explication): Ajouter le fichier Geojson nommé afrique + style créé à la carte à la MAP

//L.geoJson(afrique, {style: style}).addTo(map);  JE L'AI DESACTIVE POUR EVITER UN CONFLIT AVEC LE CODE DE LA PHASE 6 
																						//(MEME PRINCIPE QUE LA PHASE 4)


//ETAPE 6 : AJOUTER DE L'INTERACTION
// Phase 1 : Fonction pour surligner une entité
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: 'red',
        dashArray: '1',
        fillOpacity: 0.8
    });

    layer.bringToFront(); //il met le contour rouge en avant
}

// Phase 2 :Fonction pour réinitialiser le style lorsqu'on quitte l'entité
function resetHighlight(e) {
    geojson.resetStyle(e.target);  // Réinitialiser le style de l'entité
}

//Phase 3 : Fonction qui lie les événements (lorsque la souris survole) à chaque entité
function onEachFeature(feature, layer) {
    // Crée un pop-up avec le nom et la densité du pays
    var popupContent = "<strong>" + feature.properties.NAME + "</strong><br>" +
                       "Densité : " + feature.properties.DENSIT_ + " habitants/km²";

    layer.on({
            mouseover: function(e) {
                highlightFeature(e);  // Surligner lors du survol
                layer.openPopup();    // Afficher le pop-up lors du survol
            },
            mouseout: function(e) {
                resetHighlight(e);    // Réinitialiser lorsque la souris quitte
                layer.closePopup();   // Ne pas l'afficher le pop-up lorsque la souris quitte
            },
            click: zoomToFeature, // Pour zoomer sur l'entité cliquée
        });

    layer.bindPopup(popupContent); // affiche le pop-up 
}

// Phase 4 : Fonction de zoom sur l'entité cliquée (FACULTATIF MAIS LIE A LA LIGNE PRECEDENTE)
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Phase 5 et finale : Afficher le résultat
var geojson = L.geoJson(afrique, {
    style: style,         // Utilise la fonction de style
    onEachFeature: onEachFeature  // Ajoute les interactions pour chaque entité
}).addTo(map);








//ETAPE 7 : AJOUTER UNE LEGENDE
//Phase 1 : Création du contrôle pour la légende

var legend = L.control({position: 'bottomleft'}); //Position définit l'emplacement de la légende sur la carte. 
                                    //D'autres positions possibles incluent 'topleft', 'topright', et 'bottomright'.

legend.onAdd = function (map) {//legend.onAdd est appelée obligatoirement par Leaflet lorsque la légende est ajoutée à la carte. 
                                                                    //C'est ici qu'on définit ce que contiendra la légende.
    var div = L.DomUtil.create('div', 'info legend'), //L.DomUtil.create('div', 'info legend')crée un élément HTML <div> pour contenir la légende. 
                                //La chaîne 'info legend' est une classe CSS associée pour styliser la légende (dans CSS).
        grades = [0, 5, 25, 50, 75, 140], // Grades: C'est un tableau qui contient les différentes plages de densité qui vont être représentées par la légende. 
                                                //Ces plages sont des intervalles pour lesquels une couleur différente sera affichée.
        labels = [], //Il sera utilisé pour stocker les éléments de la légende.
        from, to; //
        div.innerHTML = '<p>Densité de population(hab/km²)</p>';
    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1]; //Boucle For parcourt chaque i du tableau "grades" pour définir les intervalles à afficher (sauf le i++ qui permet d'avoir 100++ dans la légende)

        labels.push( //labels.push() ajoute un nouvel élément à la liste des étiquettes de la légende.
            '<i style="background:' + getColor(from + 1) + '"></i> ' + //Crée un petit carré coloré pour chaque intervalle de densité. La fonction getColor(from + 1) détermine la couleur associée à cet intervalle de densité, 
                                                                        //en appelant la fonction getColor() avec une valeur ajustée pour obtenir la couleur correcte.
            from + (to ? '&ndash;' + to : '+')); //Cette partie génère l'intervalle de densité qui sera affiché dans la légende. 
                                                //'&ndash;' est un code HTML qui représente un tiret
    }

    div.innerHTML += labels.join('<br>'); // Il joint tous les éléments du tableau labels avec des sauts de ligne (<br>) 
                                        //entre chaque élément pour que chaque intervalle soit affiché sur une nouvelle ligne.
    return div; //Il retourne l'élément <div> contenant la légende, prêt à être affiché sur la carte.
};

// Phase 2 : Ajouter la légende à la carte
legend.addTo(map);

//Phase 3 : Styliser dans CSS (voir CSS)









//ATTENTION POUR LA SUITE DU TRAVAIL, LES ETAPES 5 ET 6 DOIVENT ETRE AU DESSUS DE L'ETAPE 4 OU DANS MON CAS 
						//JE L'AI ETEINT AVEC LE DOUBLE SLASH // SINON SUPERPOSITION
						//LE JOUR TU TE PERDS SUIS CETTE INDICATION ci dessous: 
						// enlève le double slash // de l'etape 4 - phase 4 et regarde la webmap

//Etape 4 : Ajouter le shp d'Afrique

//Phase 1 : transformer le .shp en .geojson grâce au site https://mapshaper.org/
//Phase 2 : changer l'extension du geojson en JS
//Phase 3 : ajouter le fichier à une variable (VAR) : VOIR FICHIER AFRIQUE JS
//Phase 4 : connecter le fichier à notre JS de travail
//var afrique = L.geoJSON(afrique).addTo(map) //le dept correspond à mon second fichier js
//Phase finale : affichage de la carte grâce au code html donc : VOIR HTML 
