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
    message: "test",
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
    Comment: "FYI",
    ToRecipients: [
      {
        EmailAddress: {
          Name: "israelti",
          Address: "cs@israelti.com"
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
  });
}


/* Forward as Attachment */
function forwardAsAttachment(){
  Office.context.mailbox.getCallbackTokenAsync({ isRest: true }, function(result) {
    var ewsId = Office.context.mailbox.item.itemId;
    var accessToken = result.value;
    forwardAsAttachmentFunc(accessToken);
  });
}

function forwardAsAttachmentFunc(accessToken) {
  var itemId = getItemRestId();
  var getAnItemUrl = Office.context.mailbox.restUrl + "/v1.0/me/messages/" + itemId;
  var sendItemUrl = Office.context.mailbox.restUrl + "/v1.0/me/sendmail";

  $.ajax({
    url: getAnItemUrl,
    type: "GET",
    contentType: "application/json",
    headers: { Authorization: "Bearer " + accessToken }
  }).done(function (responseItem) {
    // #microsoft.graph.message
    // microsoft.graph.outlookItem
    responseItem['@odata.type'] = "#microsoft.graph.message";
    
    /* Now send mail */
    const sendMeta = JSON.stringify({
      "Message": {
        "Subject": "Please Check for Phish Activities!",
        "Body": {
          "ContentType": "Text",
          "Content": "Please Check for Phish Activities and let us know!"
        },
        "ToRecipients": [{
          "EmailAddress": {
            "Address": "benjjam@hotmail.fr"
          }
        }],
        "Attachments": [
          {
            "@odata.type": "#Microsoft.OutlookServices.ItemAttachment",
            // #Microsoft.OutlookServices.ItemAttachment - worked with graph explorer
            // #Microsoft.graph.ItemAttachment - from stack overfloow
            "Name": responseItem.Subject,
            "Item": responseItem
          }
        ]
      },
      "SaveToSentItems": "false"
    }); // Json.stringify ends

    $.ajax({
      url: sendItemUrl,
      type: "POST",
      dataType: "json",
      contentType: "application/json",
      data: sendMeta,
      headers: { Authorization: "Bearer " + accessToken }
    }).done(function (response) {
      sucessNotif("Email forward as attachment successful!");
    }).fail(function(response){
      failedNotif(response);
    }); // ajax of send mail ends

  }); // ajax.get.done ends
}


  function transferMail(event) {
    // Récupérer l'objet item du message actuel
    const item = Office.context.mailbox.item;
  
    // Récupérer les informations du message actuel
    const subject = item.subject;
    const body = item.body.getAsync();
    const to = item.to;
    const cc = item.cc;
    const attachments = item.attachments;
  
    // Ajouter le destinataire auquel transférer le message
    const transferTo = "benjjam@hotmail.fr";
  
    // Envoyer une copie du message original au destinataire spécifié
    Office.context.mailbox.makeEwsRequestAsync(
      "<?xml version='1.0' encoding='utf-8'?>" +
        "<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' " +
        "xmlns:xsd='http://www.w3.org/2001/XMLSchema' " +
        "xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'>" +
        "<soap:Header>" +
        "<t:RequestServerVersion Version='Exchange2013' " +
        "xmlns:t='http://schemas.microsoft.com/exchange/services/2006/types' />" +
        "</soap:Header>" +
        "<soap:Body>" +
        "<m:CopyItem " +
        "xmlns:m='http://schemas.microsoft.com/exchange/services/2006/messages' " +
        "xmlns:t='http://schemas.microsoft.com/exchange/services/2006/types'>" +
        "<m:ToFolderId>" +
        "<t:DistinguishedFolderId Id='sentitems' />" +
        "</m:ToFolderId>" +
        "<m:ItemIds>" +
        "<t:ItemId Id='" + item.itemId + "' />" +
        "</m:ItemIds>" +
        "</m:CopyItem>" +
        "</soap:Body>" +
        "</soap:Envelope>",
      (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          console.error("Erreur lors du transfert du message", asyncResult.error);
        } else {
          console.log("Le message a été transféré avec succès à " + transferTo);
        }
      }
    );
  
    // Indiquer que la fonction de la commande est terminée
    event.completed();
  }
