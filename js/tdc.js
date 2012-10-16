function ViewModel() {
    var self = this;
    self.contacts = ko.observableArray();
    self.responseHeaders = ko.observableArray();
    self.addContacts = function (contacts) {
        for (var contactIndex in contacts) {
            self.addContact(contacts[contactIndex]);
        }
    };
    this.addContact = function (contact) {
    	contact.oddContact = function()
    	{
    		return self.contacts.indexOf(this) % 2 !== 0; 
    	}
        self.contacts.unshift(contact);
    };
    self.addResponseHeaders = function (responseHeaders) {
        for (var responseHeaderIndex in responseHeaders) {
            self.addResponseHeader(responseHeaders[responseHeaderIndex]);
        }
    };
    this.addResponseHeader = function (contact) {
        self.responseHeaders.unshift(contact);
    };
    this.clearResponseHeaders = function() {
    	self.responseHeaders.removeAll();
    }
    this.empty = function() {
    	self.contacts.removeAll();
    };
//    this.oddContact = function() {
//    	return self.contacts.indexOf(this).Index % 2 !== 0;
//    }
}

function readHeaders(resObj) {
	var headers = [];
	var headerString = resObj.getAllResponseHeaders();
	headerString = headerString.replace(/\r\n|\r|\n/g, "; ");
	var headersStringArr = headerString.split("; ");
	for(var headerRowIndex in headersStringArr) {
		var elems = headersStringArr[headerRowIndex].split(": ");
		var key = elems[0];
		var value = elems[1];
		headers.push({"Key": key, "Value": value});
	}
	return headers;
}

$(function()
{
	var model = new ViewModel();
    ko.applyBindings(model);

    $(".example .submit").click(function() {
        var button = $(this);
        var container = button.parents(".example");
        var body = container.find(".request .body")[0];
        var url = container.find(".request .url")[0];
        var contentType = container.find(".request .content-type")[0];
        var method = container.find(".request .method")[0];

		var request = $.ajax({
		    headers: { 
    		    Accept : contentType.value,
		        "Content-Type": "application/json; charset=utf-8"
		    },
			url: url.value,
			type: method.value,
			data: jQuery.parseJSON(jQuery.trim(body.value)),
			success: function(response, status, resObj) {
				model.empty();
				var headers = readHeaders(resObj);
				model.clearResponseHeaders();
				model.addResponseHeaders(headers);
				if (response instanceof Array) {
					model.addContacts(response);
				}
			},
			error: function(response, status, resObj) {
				var resultContainer = container.find(".result");
				resultContainer.append(response);
			}
		});
    });

    $(".tabs a").click(function() {
    	var link = $(this);
    	var container = link.parents(".raw");
   		var linkItems = container.find(".tab a");
    	var index = linkItems.index(link);
    	var divItems = container.find(".tab-content");
    	divItems.removeClass("active");
    	linkItems.removeClass("active");
    	link.addClass("active");
    	$(divItems.get(index)).addClass("active");
    });
});
