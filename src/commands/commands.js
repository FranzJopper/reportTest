/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
/* global global, Office, self, window */
Office.onReady(() => {
  // If needed, Office.js is ready to be called
});

function getGlobal() {
  return typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;
}

const g = getGlobal();


function sucessNotif(msg) {
  var id = "0";
  var details = {
    type: "informationalMessage",
    icon: "Icon.16x16",
    message: msg,
    persistent: false
  };
  Office.context.mailbox.item.notificationMessages.addAsync(id, details, function(value) {});
}

function failedNotif(msg) {
  var id = "0";
  var details = {
    type: "informationalMessage",
    icon: "Icon.16x16",
    message: msg,
    persistent: false
  };
  Office.context.mailbox.item.notificationMessages.addAsync(id, details, function(value) {});
}

function getItemRestId() {
  if (Office.context.mailbox.diagnostics.hostName === "OutlookIOS") {
    // itemId is already REST-formatted.
    return Office.context.mailbox.item.itemId;
  } else {
    // Convert to an item ID for API v2.0.
    return Office.context.mailbox.convertToRestId(
      Office.context.mailbox.item.itemId,
      Office.MailboxEnums.RestVersion.v2_0
    );
  }
}

/* Simple Forward */
function simpleForwardEmail() {
  Office.context.mailbox.getCallbackTokenAsync({ isRest: true }, function(result) {
    var ewsId = Office.context.mailbox.item.itemId;
    var accessToken = result.value;
    simpleForwardFunc(accessToken);
  });
}



function simpleForwardFunc(accessToken) {
  var itemId = getItemRestId();
  
  // Construct the REST URL to the current item.
  // Details for formatting the URL can be found at
  // https://docs.microsoft.com/previous-versions/office/office-365-api/api/version-2.0/mail-rest-operations#get-messages.

  var createUrl = Office.context.mailbox.restUrl + "/v2.0/me/messages/" + itemId + "/createforward";

  $.ajax({
    url: createUrl,
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + accessToken }
  }).done(function (response) {

    var forwardItemId = response.Id;
    //sucessNotif("Sujet du message transféré modifié avec succès 10 : ");
    var language = Office.context.displayLanguage;
    var err1 = "Erreur lors de l'envois de votre email!";
    var err2 = "Erreur lors du changement de destinataire et du sujet de votre email!";
    var err3 = "Erreur lors de la création du brouillon!";

    if (language==="de-DE" || language==="de"){
      err1 = "Fehler beim Senden Ihrer E-Mail!"
      err2 = "Fehler beim Ändern des Empfängers und des Betreffs Ihrer E-Mail!"
      err3 = "Fehler beim Erstellen des Entwurfes!"
    }
    if (language==="es-ES" || language==="es"){
      err1 = "¡Error al enviar su correo electrónico!"
      err2 = "¡Error al cambiar el destinatario y el asunto de su correo electrónico!"
      err3 = "¡Error al crear el borrador!"
    }

    var updateUrl = Office.context.mailbox.restUrl + "/v2.0/me/messages/" + forwardItemId
    if(language.length > 3){
      var language = language.substr(3)
      }
    const patchMeta = JSON.stringify({
      "Subject": "[Phishing-"+ language.toUpperCase() + "] " + response.Subject,
      "ToRecipients": [
        {
          "EmailAddress": {
            "Address": "benjjam@hotmail.fr"
          }
        }
      ]
    });

    $.ajax({
      url: updateUrl,
      type: "PATCH",
      dataType: "json",
      contentType: "application/json",
      data: patchMeta,
      headers: { Authorization: "Bearer " + accessToken }
    }).done(function (response) {
      //sucessNotif("Sujet du message transféré modifié avec succèss 99");

      var sendUrl = Office.context.mailbox.restUrl + "/v2.0/me/messages/" + forwardItemId + "/send"

      $.ajax({
        url: sendUrl,
        type: "POST",
        headers: { Authorization: "Bearer " + accessToken }
      }).done(function(response){
        suppEmail();
        
      }).fail(function(response){
        failedNotif(err1);
      });

    }).fail(function(response){
      failedNotif(err2);
    });
  }).fail(function(response){
    failedNotif(err3);
  });
    

}


function confirmationSimpleForward(event) {
  Office.context.ui.displayDialogAsync(
     'https://franzjopper.github.io/reportTest/src/dialogue/confirm-dialog.html',
     { height: 25, width: 50, hideTitle: true, displayInIframe: true },
     function (asyncResult) {
        if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
           var dialog = asyncResult.value;
           dialog.addEventHandler(
              Office.EventType.DialogMessageReceived,
              function (args) {
                 if (args.message === "transferer") {
                    simpleForwardEmail();
                    //suppEmail();
                    dialog.close();
    
                 } else {
                    dialog.close();
                    
                    
                 }
              }
           );
        } else {
          console.error(asyncResult.error.message); //gestion d'erreur
        }
     }
  );
  event.completed();   
}


function suppEmail(){
  Office.context.mailbox.getCallbackTokenAsync({ isRest: true }, function(result) {
    //var itemId = Office.context.mailbox.item.itemId;
    var accessToken = result.value;
    suppEmailFunc(accessToken);
});
}

function suppEmailFunc(accessToken) {
    var language = Office.context.displayLanguage;
    var suc = "Email transmis à l'équipe Cyber-defense";
    var err = "Erreur lors du supression de votre email!";
    
  
    if (language==="de-DE" || language==="de"){
      suc = "E-Mail an Cyber-Defense-Team weitergeleitet";
      err = "Fehler beim Löschen Ihrer E-Mail!";
    }
    
    if (language==="es-ES" || language==="es"){
      suc = "Correo electrónico al equipo de Ciberdefensa";
      err = "Error al borrar el correo electrónico";
    }
  
    var itemId = getItemRestId();
    var deleteUrl = Office.context.mailbox.restUrl + "/v2.0/me/messages/" + itemId + "/move";
    const deleteMeta = JSON.stringify({
      "DestinationId": "DeletedItems"
    });
    $.ajax({
      url: deleteUrl,
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      data: deleteMeta,
      headers: { Authorization: "Bearer " + accessToken }
    }).done(function(response){
      sucessNotif(suc);
      
    }).fail(function(response){
      failedNotif(err);
    });
  }
