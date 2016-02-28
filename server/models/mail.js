var fs = require('fs');
var nodemailer = require("nodemailer");
var ics_creator = require("ics-creator");
var application_config = require("../application-config");
var smtp_config = application_config.mail.smtp;

var smtp_transport = nodemailer.createTransport(smtp_config);
smtp_transport.verify(function(error, success) {
   if (error) {
        console.log(error);
   } else {
        console.log('Server is ready to take our messages');
   }
});

module.exports = function(Mail) {
	Mail.observe('before save', function(ctx, next) {
		var mail_options = prepare_mail_with_invite(ctx.instance);
		smtp_transport.sendMail(mail_options, function(error, response) {
		    if(error) {
		        console.log(error);
		        var err = new Error("Error while sending mail", error);
				err.statusCode = 500;
				next(err);
		    } else {
		        console.log('Message sent');
		        ctx.instance.time_stamp = Date.now();
		        next();
		    }
		});
	});
};

function prepare_mail_with_invite(instance) {
		var mail_instance = {};
		mail_instance.from = instance.from;
		mail_instance.subject = instance.subject;
		mail_instance.text = instance.text;
		if(instance.to) {
			mail_instance.to = instance.to.join(',');
		}
		if(instance.cc) {
			mail_instance.cc = instance.cc.join(',');
		}
		if(instance.bcc) {
			mail_instance.bcc = instance.bcc.join(',');
			mail_instance.location = mail_instance.bcc.substr(0, mail_instance.bcc.indexOf('@')); 
		}
		if(instance.html) {
			mail_instance.html = read_template(instance.html);
			if(instance.html == 'invite') {
				mail_instance.attachments = [{
			        filename: 'sign.png',
			        path: './server/images/sign.png',
			        cid: 'sign'
			    }];
			}
		}
	var ics = ics_creator.createNodemailerEvent({
		'organizerName': 'Sai Pranav',
		'organizerEmail': mail_instance.from,
		'attendeeName':'',
		'attendeeEmail': mail_instance.to,
		'body': mail_instance.html,
		'attach': mail_instance.attachments,
		'subject': mail_instance.subject,
		'location':mail_instance.location,
		'uuid': 'Fastest KT invite ID',
		'start': new Date("28 Feb,2016 15:00"),
		'end': new Date("28 Feb,2016 16:00"),
		'currentTime': new Date()
	},'event');
	var mail_options = {
	    from: mail_instance.from,
	    to: mail_instance.to,
	    subject: mail_instance.subject,
	    cc: mail_instance.cc,
	    bcc: mail_instance.bcc,
	    text: mail_instance.text,
	    html: mail_instance.html,
	    attachments: mail_instance.attachments,
	    icalEvent: ics
	};
	return mail_options;
}

function read_template(template_name) {
	return fs.createReadStream('./server/templates/'+template_name+'.html');
}