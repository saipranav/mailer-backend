var fs = require( "fs" );
var nodemailer = require( "nodemailer" );
var icsCreator = require( "ics-creator" );
var applicationConfig = require( "../application-config" );
var smtpConfig = applicationConfig.mail.smtp;

var smtpTransport = nodemailer.createTransport( smtpConfig );
smtpTransport.verify( function ( error , success ) {
  if ( error ) {
    console.log( error );
  } else {
    console.log( "Server is ready to take our messages" );
  }
} );

module.exports = function ( Mail ) {
  Mail.observe( "before save" , function ( ctx , next ) {
    var mailOptions = prepareMailWithInvite( ctx.instance );
    smtpTransport.sendMail( mailOptions , function ( error , response ) {
      if ( error ) {
        console.log( error );
        var err = new Error( "Error while sending mail" , error );
        err.statusCode = 500;
        next( err );
      } else {
        console.log( "Message sent" );
        ctx.instance.timeStamp = Date.now();
        next();
      }
    } );
  } );
};

function prepareMailWithInvite ( instance ) {
  var mailInstance = {};
  mailInstance.from = instance.from;
  mailInstance.subject = instance.subject;
  mailInstance.text = instance.text;

  if ( instance.to ) {
    mailInstance.to = instance.to.join( "," );
  }

  if ( instance.cc ) {
    mailInstance.cc = instance.cc.join( "," );
  }

  if ( instance.bcc ) {
    mailInstance.bcc = instance.bcc.join( "," );
    mailInstance.location = mailInstance.bcc
                                        .substr( 0 ,
                                                mailInstance.bcc
                                                            .indexOf( "@" )
                                        );
  }

  if ( instance.html ) {
    mailInstance.html = readTemplate( instance.html );
    if ( "invite" == instance.html ) {
      mailInstance.attachments = [ {
        "cid" : "sign" ,
        "filename" : "sign.png" ,
        "path" : "./server/images/sign.png"
      } ];
    }
  }

  var ics = icsCreator.createNodemailerEvent( {
    "attach" : mailInstance.attachments ,
    "attendeeEmail" : mailInstance.to ,
    "attendeeName" : "" ,
    "body" : mailInstance.html ,
    "currentTime" : new Date() ,
    "end" : new Date( "28 Feb,2016 16:00" ) ,
    "location" : mailInstance.location ,
    "organizerEmail" : mailInstance.from ,
    "organizerName" : "Sai Pranav" ,
    "start" : new Date( "28 Feb,2016 15:00" ) ,
    "subject" : mailInstance.subject ,
    "uuid" : "Fastest KT invite ID"
  } , "event" );

  var mailOptions = {
    "attachments" : mailInstance.attachments ,
    "bcc" : mailInstance.bcc ,
    "cc" : mailInstance.cc ,
    "from" : mailInstance.from ,
    "html" : mailInstance.html ,
    "icalEvent" : ics ,
    "subject" : mailInstance.subject ,
    "text" : mailInstance.text ,
    "to" : mailInstance.to
  };
  return mailOptions;
}

function readTemplate ( templateName ) {
  return fs.createReadStream( "./server/templates/" + templateName + ".html" );
}