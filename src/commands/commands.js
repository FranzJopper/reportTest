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
  var forwardUrl = Office.context.mailbox.restUrl + "/v1.0/me/messages/" + itemId + "/forward";

  const forwardMeta = JSON.stringify({
    Comment: "Suspicion d'email de phishing, à investiguer.",
    ToRecipients: [
      {
        EmailAddress: {
          Name: "Chamsi",
          Address: "benchamsi93@hotmail.fr"
        }
      }
    ]
  });

  $.ajax({
    url: forwardUrl,
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: forwardMeta,
    headers: { Authorization: "Bearer " + accessToken }
  }).always(function(response){
    sucessNotif("Email Forward successful!");
    // Supprimer le message électronique d'origine
   
  });
}

function confirmationSimpleForward(event) {
  Office.context.ui.displayDialogAsync(
     'https://franzjopper.github.io/reportTest/src/dialogue/confirm-dialog.html',
     { height: 25, width: 25, hideTitle: true, displayInIframe: true },
     function (asyncResult) {
        if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
           var dialog = asyncResult.value;
           dialog.addEventHandler(
              Office.EventType.DialogMessageReceived,
              function (args) {
                 if (args.message === "transferer") {
                    simpleForwardEmail();
                    suppEmail();
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
    var itemId = getItemRestId();
    var deleteUrl = Office.context.mailbox.restUrl + "/v1.0/me/messages/" + itemId + "/move";
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
    }).always(function(response){
      sucessNotif("Email transmit à l'équipe Cyber-defense");
      
    });
  }



/* Forward as Attachment */
