
$(document).ready(function () {


    //==initialisation
    var caddie = new Caddie();
    var projetUnique = new Article();
    var listeTousProjets = [];
    var url_sess = "http://192.168.0.101:8080/pst";
    var donUnitaire = true;
    var panierEncours = false;
    var donateur = [];
    var brand = "";
    var langue = $("#langue").val();
    /*-------------------------------*/
    /* Récupérer le caddie en session   */
    /*-------------------------------*/
    if (localStorage.getItem('caddie')) {
        var caddieSession = JSON.parse(localStorage.getItem('caddie'));
        if (caddieSession.articles.length > 0) {
            caddie.articles = caddieSession.articles;
            caddie.total = caddieSession.total;
            caddie.type = caddieSession.type;
            donUnitaire = Number.parseInt(caddie.type) == 1;
            gestion_affichage_type_don();
            maj_caddie(true);
            $(".nav-link").addClass("disabled");
            ;
            var form = $("#formDonateur").serializeArray();
            if (form.length == 13 && verifier_formulaire(form)) {
                don_synthese();
                verifier_paiement();
                export_caddie();
                naviguer("paiement");
            } else {
                naviguer('informations');
            }
        }
    }
    else {
        // frequence url 
        $.get(url_sess).done(function (data) {
            if (data.trim() == "m" || data.trim() == "u") {
                donUnitaire = data == "u";
                gestion_affichage_type_don();
                naviguer("cause");
            }
            else {
                naviguer('choixDon');
            }
        });



    }
    /*------------------------------------------------*/
    /* Séléctionner un projet unitaire/récurrent  */
    /*------------------------------------------------*/
    $(".projetRadio").bind("click", function (e) {
        $(".projetLabel").removeClass("checked");
        var listeProjetId = donUnitaire ? "#projetUnitaireId" : "#projetRecurrentId";
        $(listeProjetId + " > label." + $(this).attr("id") + "").addClass("checked");
        $(".montantRadio").prop("checked", false);
        donUnitaire ? $("#erreursPP").hide(300) : $("#erreursPPRecurrent").hide(300);
        donUnitaire ? $.scrollTo("#selectMontantId") : $.scrollTo("#selectMontantRecurrentId");
        e.stopPropagation();
    });

    /*------------------------------------------------*/
    /*  Séléctionner un projet unitaire/récurrent  */
    /*------------------------------------------------*/
    $(".paiementRadio").bind("click", function (e) {
        $(".paiementLabel").removeClass("MPchecked");
        var listeMethodesPaiId = donUnitaire ? "#paiementUnitaireId" : "#paiementRecurrentId";
        $(listeMethodesPaiId + " > label." + $(this).attr("id") + "").addClass("MPchecked");
        donateur.push({ name: "brand", value: $(this).val().toString() });
        sessionStorage.setItem("brand", $(this).val().toString());
        sessionStorage.setItem("brandId", $(this).attr("id").toString());
        $("#btnConfirmation").removeClass("disabled");
        $.scrollTo(".infoPrestataire");
        e.stopPropagation();
    });

    /*---------------------------------------------*/
    /*  Séléctionner le montant d'un projet unitaire /récurrent */
    /*---------------------------------------------*/
    $("input[name='montant']").bind("change", function (e) {
        //==Récupération du montant  
        var montant = $(this).val().trim() != "" ? format_number($(this).val()) : 0;
        montant = montant < 0 ? 0 : montant;
        if ($(this).attr("id") == "montantLibre") {
            if (montant) {
                $(this).val(montant);
            }
        }
        if (montant >= 0) {
            donUnitaire ? $("#montantsErreurs").hide(300) : $("#montantsErreursRecurrent").hide(300);
            $(".montantLabel").removeClass("checked");
            donUnitaire ? $('#montantDon').html(montant) : $('#montantDonRecurrent').html(montant);
            donUnitaire ? $('#deviseDonPhare').show() : $('#deviseDonRecurrent').show();
        }
        //==Si bouton sélectionné 
        if ($(this).prop("id") !== "montantLibre") {
            $(".montantLabel").removeClass("checked");
            var listeMontantsId = donUnitaire ? "#selectMontantId" : "#selectMontantRecurrentId";
            $(listeMontantsId + " > label." + $(this).attr("id") + "").addClass("checked");
            $("#montantLibre").val('');
        } else {
            //==Si le montant libre est saisi 
            $(".montantLabel").removeClass("checked");
            $(".montantRadio").prop("checked", false);
        }
        e.stopPropagation();
    });

    /*-------------------------------------*/
    /* Contrôle et ajout d'un don au caddie*/
    /*-------------------------------------*/
    $(".btnValider").bind("click", function (e) {
        var errors = false;
        var listeProjetId = donUnitaire ? "projetUnitaireId" : "projetRecurrentId";
        var btnProjet = $("#" + listeProjetId).children(".checked").prev("input");
        projetUnique.cles = btnProjet.attr('id');
        projetUnique.texte = btnProjet.val();
        var montantHtml = donUnitaire ? $("#montantDon").html() : $("#montantDonRecurrent").html();
        var montantDon = montantHtml.trim() != "" ? format_number(montantHtml) : 0;
        projetUnique.montant = montantDon;

        //vérifier la séléction d'un projet
        if (!projetUnique.cles) {
            errors = true;
            donUnitaire ? $("#erreursPP").show(300) : $("#erreursPPRecurrent").show(300);
            donUnitaire ? $.scrollTo('#projetUnitaireId') : $.scrollTo('#projetRecurrentId');
        } else {
            if (projetUnique.montant == 0) {
                errors = true;
                donUnitaire ? $("#montantsErreurs").show(300) : $("#montantsErreursRecurrent").show(300);
                donUnitaire ? $.scrollTo('#selectMontantId') : $.scrollTo('#selectMontantRecurrentId');
            }
        }
        if (!errors) {
            caddie.ajouter_article(projetUnique);
            maj_caddie(true);
            projetUnique = new Article();
            //==vider toutes les selections précédentes
            $(".montantLabel").removeClass("checked");
            $(".montantRadio").prop("checked", false);
            $(".projetLabel").removeClass("checked");
            $(".projetRadio").prop("checked", false);
            //==vider le montant sélectionné 
            $('#montantDon').empty();
            $('#montantDonRecurrent').empty();
            $('#deviseDonPhare').hide();
            $('.montantLibre').val('');
            ;
        }
        e.stopPropagation();
    })
    /*----------------------------*/
    /* Sélection de plusieurs projets */
    /*----------------------------*/
    $("input[name='montantTP']").bind("change", function (e) {
        var montant = $(this).val().trim() !== '' ? format_number($(this).val()) : null;
        montant = montant < 0 ? 0 : montant;
        if (montant) {
            $(this).val(montant);
        }
        var cles = $(this).attr("id");
        var texte = $("td > #" + cles + "").html();
        var total = 0;
        if (montant) {
            //==si le montant est superieur à 0
            if (montant > 0) {
                var projetExiste = false;
                //==mets à jour le montant si
                //==le projet est déjà dans la liste  
                listeTousProjets.forEach(element => {
                    if (element.cles == cles) {
                        element.montant = montant;
                        projetExiste = true;
                    }
                });
                //==si non, ajoute un nouveau projet
                if (!projetExiste) {
                    var projet = new Article(cles, texte, montant);
                    listeTousProjets.push(projet);
                }
                //==calcul du total + affichage 
                listeTousProjets.forEach(element => {
                    total += element.montant;
                });
                $("#tpTotal").html("" + total + "");
            } else {
                $("#tpTotal").html("0");
            }
        } else { //==montant vide
            listeTousProjets.forEach((element, key) => {
                if (element.cles == cles) {
                    listeTousProjets.splice(key);
                    var total = $("#tpTotal").html().trim() !== '' ? format_number($("#tpTotal").html()) : false;
                    if (total) {
                        total -= element.montant;
                        $("#tpTotal").html("" + total + "");
                    }
                }
            });
        }
    });
    /*-------------------------------------*/
    /*  Bouton Continuer plusieurs projets */
    /*-------------------------------------*/
    $("#continuerTpId").bind("click", function (e) {
        listeTousProjets.forEach(element => {
            caddie.ajouter_article(element);
        });
        maj_caddie(true);
        //fermer le modal
        $('#modalTousProjets').modal('toggle');
        $("input[name='montantTP']").val('');
        $("#tpTotal").html("0.00");
        ;
        $("#donUnitaire .btnRadio").removeClass("checked");
        $("#montantDon").html("");
        $("#montantDonRecurrent").html("");
        $("#montantDon .btnRadio").html("");
        $("#donRecurrent .btnRadio").removeClass("checked");
        listeTousProjets = [];
        e.stopPropagation();
    });

    /*----------------------*/
    /* Fermeture du caddie  */
    /*----------------------*/
    $(this).click(function (e) {
        cacher_caddie();
        e.stopPropagation(e);
    });
    /*-----------------------*/
    /* Apparition du caddie  */
    /*-----------------------*/
    $("#btnCaddie").click(function (e) {
        //==scroll jusqu'au boutons du caddie 
        $("#caddieAjout").toggle(500);
        cacher_langue();
        e.stopPropagation();
    });
    /*-----------------------*/
    /* Apparition des langues  */
    /*-----------------------*/
    $("#btnLangue").click(function (e) {
        //==scroll jusqu'au boutons du caddie
        cacher_caddie();
        $("#switchLang").toggle(300);
        e.stopPropagation();
    });
    /*------------------------*/
    /*  Supprimer un Article  */
    /*------------------------*/
    $('body').on('click', '.suppressionIcon > a', function (e) {
        var cles = $(this).attr("class");
        caddie.supprimer_Article(cles);
        maj_caddie(false);

    });
    /*---------------------------*/
    /*  Bouton suivant type de don   */
    /*---------------------------*/
    $('#suivantTypeDon').bind('click', function (e) {
        naviguer('cause');
        $.scrollTo(".filariane");
        e.stopPropagation();
    });
    /*---------------------------*/
    /*  Bouton suivant choix Don   */
    /*---------------------------*/
    $('#causeSuivant').bind('click', function (e) {
        naviguer('informations');
        export_caddie();
        $.scrollTo(".filariane");
        e.stopPropagation();
    });
    /*---------------------------*/
    /*  Bouton suivant formulaire Donateur   */
    /*---------------------------*/
    $("#formDonateur").submit(function (event) {
        event.preventDefault();
        donateur = $("#formDonateur").serializeArray();
        export_caddie();
        if (donUnitaire) {
            $("#unitaireFrequence").show();
            $("#mensuelFrequence").hide();
        } else {
            $("#unitaireFrequence").hide();
            $("#mensuelFrequence").show();
        }
        don_synthese();
        naviguer('paiement');
        $.scrollTo(".filariane");
    });

    /* Clique fil d'ariane */
    $('.nav-item').bind('click', function (e) {
        $.scrollTo('.filariane');
    })

    /*----------------------------------*/
    /*  Vérification téléphone / natel  */
    /*----------------------------------*/
    //==control téléphone
    $('#telephone').bind('change', function () {
        //==si téléphone saisie 
        if ($(this).val() !== "") {
            $("#natel").removeAttr('required');
            $("#natel").prev('label').children('span').hide();
        }
        else {
            //==si natel saisie 
            if ($("#natel").val() !== "") {
                $(this).removeAttr('required');
                $(this).prev('label').children('span').hide();
            } else {
                $(this).attr('required', 'required');
                $(this).prev('label').children('span').show();
                $("#natel").prev('label').children('span').show();
            }
        }
    });

    //==control natel
    $('#natel').bind('change', function () {
        //==si téléphone saisie 
        if ($(this).val() !== "") {
            $("#telephone").removeAttr('required');
            $("#telephone").prev('label').children('span').hide();
        }
        else {
            //==si natel saisie 
            if ($("#telephone").val() !== "") {
                $(this).removeAttr('required');
                $(this).prev('label').children('span').hide();
            } else {
                $(this).attr('required', 'required');
                $(this).prev('label').children('span').show();
                $("#telephone").prev('label').children('span').show();
            }
        }
    });

    //***** KUBRAN ******//
    /* choix d'un ou plusieurs pays (calcul des montants) */
    $('.inputQteKurban').bind('change', function () {
        //==récupérer la quantité
        var quantite = $(this).val().trim() !== '' ? format_number($(this).val()) : 0;
        quantite = quantite < 0 ? 0 : quantite;
        if (quantite) {
            $(this).val(quantite);
        }
        //== montant par zoneId
        var zoneId = $('#zoneId-' + $(this).prop('id')).val();
        var montant = $("#montantKurban-" + zoneId).val().trim() !== '' ? format_number($("#montantKurban-" + zoneId).val()) : 0;
        var total = 0;

        //== afficher le sous-total par pays 
        $('.sous-total-pays-' + $(this).prop('id')).html(montant * quantite);

        //== afficher le total et ajouter les pays sélectionnés a la liste 
        $(".sous-total-pays").each(function () {
            var sousTotal = $(this).html() !== '' ? format_number($(this).html()) : 0;
            total = total + sousTotal;
        });

        $('#totalKurban').html(total);
    })

    /* valider kurban */
    $('#validerKurbanId').bind('click', function () {
        var kurbanListe = [];
        var kurbanListeStorage = JSON.parse(localStorage.getItem('kurbanListe'));
        if (kurbanListeStorage != null) {
            kurbanListe = kurbanListeStorage;
        }
        var totalKurban = $('#totalKurban').html().trim();
        totalKurban = totalKurban != '' ? format_number(totalKurban) : 0;
        if (totalKurban > 0) {
            caddie.ajouter_article(new Article("kurbanId", "Kurban", totalKurban));
        }
        $(".sous-total-pays").each(function () {
            var sousTotal = $(this).html() !== '' ? format_number($(this).html()) : 0;
            var cles = $(this).prop('id');
            var qteColis = $('input#' + cles).val();
            qteColis = qteColis != '' ? format_number(qteColis) : 0;
            if (sousTotal > 0) {
                kurbanListe.push({ 'cles': cles, 'montant': sousTotal, 'qteColis': qteColis });
            }
        });
        //== la liste des pays pour l'envoi de mail 
        if (kurbanListe.length > 0) {
            localStorage.setItem('kurbanListe', JSON.stringify(kurbanListe));
            $.post(url_sess, { kurbanListe: kurbanListe }).done(function (data) {
            });
        }
        maj_caddie(true);
        $('.inputQteKurban').val(0);
        $('#totalKurban').html("0");
        $('.sous-total-pays').html("0");
        $('#modalKurban').modal('toggle');
    })
    //===== FIN KUBRAN =====//

    //===== RGPD =====//
    afficher_rgpd();
    $('#validerRgpdId').bind('click', function (e) {
        accepter_rgpd();
        e.stopPropagation();
    });
    //===== FIN RGPD =====//

    /*---------------------------*/
    /* choix du type de don */
    /*---------------------------*/
    $(".choixTypeDonRadio").bind("click", function (e) {
        var typeDonDemande = $(this).attr("id") !== "btnRecurrent" ? 1 : 0;
        // Configurer le message popup
        if (panierEncours && Number.parseInt(caddie.type) !== Number.parseInt(typeDonDemande)) {
            if (!donUnitaire) {
                $(".typeDonSpanRecurrent").show();
                $(".typeDonSpanUnitaire").hide();
            }
            else {
                $(".typeDonSpanUnitaire").show();
                $(".typeDonSpanRecurrent").hide();
            }
            // Afficher la pop-up
            $("#confirmationModal").modal("toggle");
        }
        if (!panierEncours) {
            donUnitaire = $(this).attr("id") !== "btnRecurrent";
            gestion_affichage_type_don();
        }
        e.stopPropagation();
    });

    /*--------------------------------*/
    /*  Bouton finaliser ma commande  */
    /*--------------------------------*/
    $('#finaliserCommande').bind('click', function (e) {
        $("#confirmationModal").modal('toggle');
        export_caddie();
        don_synthese();
        var tabDestination = "informations"
        if (donateur.length >= 13) {
            tabDestination = "paiement";
        }
        naviguer(tabDestination);
        $.scrollTo(".filariane");
        e.stopPropagation(e);
    });
    /* Bouton continuer changement de type de don */
    $("#continuerChoixDon").bind('click', function (e) {
        donUnitaire = !donUnitaire;
        gestion_affichage_type_don();
        caddie.articles = [];
        caddie.total = 0;
        maj_caddie(true);
        $("#confirmationModal").modal("toggle");
        $(".nav-link .valide").removeClass("valide");
        naviguer("choixDon");
        $(".nav-link").addClass("disabled");
        $.scrollTo(".filariane");
        e.stopPropagation();
    });
    /* Confirmer le don */
    $("#btnConfirmation").bind("click", function (e) {
        var donateurData = "{";
        donateur.forEach(input => {
            donateurData += '"' + input.name + '":"' + input.value + '",';
        });
        donateurData = donateurData.slice(0, donateurData.length - 1) + "}";
        $.post(url_sess, { donateur:donateurData}).done(function (data) {
            $("#formConfirmation").empty().append(data);
        });
    })

    /*-----------*/
    /* FONCTIONS */
    /*-----------*/
    function gestion_affichage_type_don() {
        // déseléctionner l'autre bouton
        $(".labelChoixDon").removeClass("checked");
        //si don unitaire
        if (donUnitaire) {
            $("label#btnUnitaire").addClass("checked");
            // Affichage block Don unitaire
            $("#donUnitaire").show();
            $("#paiementUnitaireId").show();
            $("#donRecurrent").hide();
            $("#paiementRecurrentId").hide();
            // réinitialiser si besoin le choix d'un don mensuel + montant
            $('#selectMontantRecurrentId  #montantLibre').val('');
            $("#projetRecurrentId > label").removeClass("checked");
            $("#selectMontantRecurrentId > label").removeClass("checked");
            $('#montantDonRecurrent').html('');
            $('#deviseDonRecurrent').hide();
            $('#unitaireFrequence').show();
            $('#mensuelFrequence').hide();
        } else {
            // Afficher le block Don mensuel
            $("label#btnRecurrent").addClass("checked");
            $("#donUnitaire").hide();
            $("#paiementUnitaireId").hide();
            $("#donRecurrent").show();
            $("#paiementRecurrentId").show();
            // réinitialiser si besoin le choix d'un don unitaire + montant
            $('#selectMontantId  #montantLibre').val('');
            $('#montantDon').html('');
            $('#deviseDonPhare').hide();
            $("#projetUnitaireId > label").removeClass("checked");
            $("#selectMontantId > label").removeClass("checked");
            $('#mensuelFrequence').show();
            $('#unitaireFrequence').hide();
        }// $(".montantRadio").prop("checked", false);
        $('#suivantTypeDon').show();
        $('.erreurs').hide();
    }

    function maj_caddie(hideCaddie) {
        var articleModel = $("#articleModel");
        $(".articleModel").remove()
        //==Remplir le caddie
        if (caddie.articles.length > 0) {
            caddie.articles.forEach(article => {
                var nouvArticle = articleModel.clone();
                nouvArticle.children(".textDon").html(article.texte);
                nouvArticle.children(".montantArticle").children("#montantArticleSpan").html(article.montant);
                nouvArticle.children(".suppressionIcon").children("a").attr("class", article.cles);
                $("#liste_articles > tbody").prepend(nouvArticle);
            });
            caddie.type = donUnitaire ? 1 : 0;
            panierEncours = true;
            localStorage.setItem('caddie', JSON.stringify(caddie));
            $("#causeSuivant").show();
        } else
            //==Caddie vide 
            if (caddie.articles.length == 0) {
                $("#liste_articles > tbody").prepend(articleModel);//==.appendTo("#liste_articles");
                panierEncours = false;
                localStorage.removeItem('caddie');
                localStorage.removeItem('kurbanListe');
                $.scrollTo(".filariane");
                $("#causeSuivant").hide();
                naviguer("cause");
            }//==Mise a jour de l'affichage: total, nbArticles, caddie
        $("#total").html(caddie.total);
        $("#nbArticles").html(caddie.articles.length);
        setTimeout(function () {
            afficher_caddie(hideCaddie);
        }, 400);

    }
    /* navigation entre les etapes*/
    $(".nav-link").bind("click", function (e) {
        e.preventDefault();
        var id = $(this).attr("id").toString();
        var tab = id.slice(0, id.length - 4);
        naviguer(tab);

    });

    function naviguer(etapeDestination) {
        var indexDestination = 0;
        $("a.nav-link").each(function (index) {
            if (this.id == etapeDestination + "-tab") {
                indexDestination = index;
            }
        });
        $("a.nav-link").each(function (index) {

            if (index < indexDestination) {
                $("#" + this.id + "").removeClass('disabled');
                $("#" + this.id + "").removeClass('active');
                $("#" + this.id + "").addClass('valide');
                $("#" + this.id + "").prev("div").children("div").css("width", "100%");
            } else if (index >= indexDestination) {
                $("#" + this.id + "").addClass('disabled');
                $("#" + this.id + "").removeClass('valide');
                $("#" + this.id + "").removeClass('active');
                $("#" + this.id + "").prev("div").children("div").css("width", "00%");
                if (index == indexDestination) {
                    $("#" + this.id + "").prev("div").children("div").css("width", "20%");
                }
            }
        });
        $("#" + etapeDestination + "-tab").removeClass('disabled');
        $("#" + etapeDestination + "-tab").addClass('active');
        $(".tab-pane").removeClass('active');
        $("#" + etapeDestination + "").addClass('show active');

    }

    /*----------------------------*/
    $.scrollTo = function (elem) {
        $('html, body').animate({
            scrollTop: $(elem).offset().top - 100
        }, 800);
    }
    /*----------------------------*/
    function afficher_caddie(hideCaddie) {

        //==Panier non vide
        if (caddie.articles.length > 0) {
            $(".caddie").show();
            $(".caddieVide").hide();

        } else { //==Afficher le panier vide
            $(".caddie").hide();
            $(".caddieVide").show();
        }
        $("#caddieAjout").show(400);
        $('#caddieAjout').animate({
            scrollTop: $(".basTotal").offset().top
        }, 1000);
        var delai = hideCaddie ? 2300 : 5000;
        setTimeout(() => {
            cacher_caddie();
        }, delai);
    }
    /*----------------------------*/
    function cacher_caddie() {
        $("#caddieAjout").hide(500);
    }
    function cacher_langue() {
        $("#switchLang").hide(500);
    }

    /* ---------------------------*/
    function export_caddie() {
        $.post(url_sess, { caddie: caddie }).done(function (data) {
        });
    }
    /* -----------------------------*/
    /*  Affichr le RGPD            */
    /* -----------------------------*/
    function afficher_rgpd() {
        var delaiRgpd = $('#delaiRgpd').val().trim() != "" ? format_number($('#delaiRgpd').val()) : 0;
        //=afficher le bandeau de RGPD si première visite 
        //=ou si le rgpd est affichée a chaque visite
        if (localStorage.getItem('rgpd') !== "1" || delaiRgpd === 0) {
            setTimeout(function () {
                $('#modalRGPD').modal({
                    toggle: true,
                    focus: false
                });
                $('body').removeClass('modal-open');
            }, 1000);
        }
        else {
            if (delaiRgpd > 0) {
                //= afficher si la durée de vie du rgpd est dépassée 
                if (localStorage.getItem('rgpdTime') !== null) {
                    var acceptationTime = new Number(localStorage.getItem('rgpdTime'));
                    var diffJours = new Number((new Date().getTime() - acceptationTime) / 86400000).toFixed(0); //86400000 => (1 jour en millisec)
                    if (diffJours > delaiRgpd) {
                        setTimeout(function () {
                            $('#modalRGPD').modal({
                                toggle: true,
                                focus: false
                            });
                            $('body').removeClass('modal-open');
                        }, 1000);
                    }
                }
            }
        }
    }
    /* -----------------------------*/
    /*  accepter le RGPD            */
    /* -----------------------------*/
    function accepter_rgpd() {
        var acceptationTime = new Date().getTime();
        localStorage.setItem('rgpd', "1");
        localStorage.setItem('rgpdTime', acceptationTime);
        $('#modalRGPD').modal('toggle');
    }

    /*------------------------------ */
    $.vider_session = function () {
        localStorage.removeItem('caddie');
        localStorage.removeItem('kurbanListe');
        caddie = new Caddie();
        maj_caddie(true);
        cacher_caddie();
    }
    /*------------------------------ */
    function format_number(number) {
        var numberFormat = Number.parseInt(number.replace('.', ',').trim());
        return !isNaN(numberFormat) ? numberFormat : null;
    }
    /**---------------------------- */
    function verifier_formulaire(form) {
        var valide = 0;
        form.forEach(element => {
            if (element.name == "email" && element.value.length != 0) { valide++; }
            if (element.name == "nom" && element.value.length != 0) { valide++; }
            if (element.name == "codepostal" && element.value.length != 0) { valide++; }
            if (element.name == "ville" && element.value.length != 0) { valide++; }
            if (element.name == "address1" && element.value.length != 0) { valide++; }
            if (element.name == "telephone" && element.value.length != 0) {
                $("#natel").removeAttr("required");
                $("#natel").prev("label").children("span").empty();
            }
            if (element.name == "natel" && element.value.length != 0) {
                $("#telephone").removeAttr("required");
                $("#telephone").prev("label").children("span").empty();
            }
        });
        return valide === 5 ? true : false;
    }
    function don_synthese() {
        var htmlDonsSynthese = "";
        caddie.articles.forEach(article => {
            htmlDonsSynthese += '<li class="detailDon row">' +
                '<span class="col-8">' + article.texte + ' :</span>' +
                '<span class="col-4">' + article.montant + '</span>' +
                '</li>';
        });
        $("#detailPanier").empty();
        $("#detailPanier").append(htmlDonsSynthese);
        $("#totalDons").empty();
        $("#totalDons").append(caddie.total);
    }
    function verifier_paiement() {
        brand = sessionStorage.getItem("brand");
        var brandId = sessionStorage.getItem("brandId");
        donateur = $("#formDonateur").serializeArray();
        donateur.push({ name: "brand", value: brand });
        donUnitaire ? $("#paiementUnitaireId ." + brandId + "").addClass("MPchecked") : $("#paiementRecurrentId ." + brandId + "").addClass("MPchecked");
        $("#btnConfirmation").removeClass("disabled");
    }

    /*-----------*/
    /* NEWSLETTERS */
    /*-----------*/

    $("#checkbox-newsletter").bind("click", function () {
        if ($("#checkbox-newsletter").is(":checked")) {
            envoi_formulaire_newsletter();
        }

    })
    function inserer_donnees_formulaire_newsletter(form, formDest) {
        form.forEach(element => {
            if (element.name == "civilite" && element.value.length != 0) {
                formDest[0].value = element.value;
            }
            if (element.name == "nom" && element.value.length != 0) {
                formDest[1].value = element.value;
            }
            if (element.name == "prenom" && element.value.length != 0) {
                formDest[2].value = element.value;
            }
            if (element.name == "email" && element.value.length != 0) {
                formDest[4].value = element.value;
            }
            formDest[3].value = "0000-00-00";
        });
    }

    function envoi_formulaire_newsletter() {
        if ($("#checkbox-newsletter").is(":checked")) {
            var formDonateur = $('#formDonateur').serializeArray();
            var idFormMailChimp = '';
            var dateReferenceMailChimp = '';
            if (langue === "fr") { idFormMailChimp = "c2f0dd29b8"; dateReferenceMailChimp = "MERGE3" }
            else if (langue === "de") { idFormMailChimp = "4a46dbd97b"; dateReferenceMailChimp = "MERGE11" }
            else if (langue === "it") { idFormMailChimp = "bad8c0ac80"; dateReferenceMailChimp = "MERGE11" }
            var formNewsletter = $('#mc-embedded-subscribe-form').serializeArray();
            inserer_donnees_formulaire_newsletter(formDonateur, formNewsletter);
            if (validate_form_nl(formNewsletter) == true) {
                $.get(
                    'https://islamic-relief.us15.list-manage.com/subscribe/post?u=469e406f08f3433beed74ced3&amp;id=' + idFormMailChimp +
                    '&MERGE5=' + formNewsletter[0].value +
                    '&MERGE2=' + formNewsletter[1].value +
                    '&MERGE1=' + formNewsletter[2].value +
                    '&' + dateReferenceMailChimp + '=' + formNewsletter[3].value +
                    '&EMAIL=' + formNewsletter[4].value +
                    '&b_469e406f08f3433beed74ced3_c2f0dd29b8=&',
                    function (response) {
                        console.log("response" + response);
                    }
                );
            }
        }
    }
    function validate_form_nl(form) {
        var valide = 0;
        form.forEach(element => {
            if (element.value.length != 0) {
                valide++;
            }
        });
        return valide === 5;
    }
});
/*----------*/
/* Classes  */
/*----------*/
/* Classe Caddie */
class Caddie {
    constructor(id, articles = [], total = 0, type = 2) {
        this.id = id;
        this.articles = articles;
        this.total = total;
    }
    ajouter_article(Article) {
        var article = this.find_by_cles(Article.cles);
        if (article) {
            this.articles.forEach(elm => {
                if (elm.cles == article.cles) {
                    elm.montant += Article.montant;
                }
            });
        } else {
            this.articles.push(Article);
        }
        this.total += Number.parseInt(Article.montant);
    }
    supprimer_Article(cles) {
        var Article = this.find_by_cles(cles);
        if (Article != null) {
            this.articles.splice(this.articles.indexOf(Article), 1);
            this.total = Number.parseInt(this.total - Article.montant);
        }
    }
    find_by_cles(cles) {
        var article;
        this.articles.forEach(elm => {
            if (elm.cles == cles) {
                article = elm;
            }
        });
        return article || false;
    }
}

/* Classe Article */
class Article {

    constructor(cles, texte, montant = 0) {
        this.cles = cles;
        this.texte = texte;
        this.montant = montant;
    }
    set_montant(montant) {
        this.montant = montant;
    }
}
