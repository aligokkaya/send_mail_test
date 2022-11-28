var ua = window.navigator.userAgent;
var msie = ua.indexOf("MSIE");
// Si c'est Internet Explorer, affiche le message d'erreur
if (msie > -1 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
    var div =  document.getElementById("ieMessage");
    div.setAttribute('style', 'display:block;');
} 
 