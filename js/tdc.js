
var requestHeaders = [];

XMLHttpRequest.prototype.wrappedSetRequestHeader = 
  XMLHttpRequest.prototype.setRequestHeader; 

XMLHttpRequest.prototype.setRequestHeader = function(key, value) {
    this.wrappedSetRequestHeader(key, value);
    if(!requestHeaders) {
        requestHeaders = [];
    }

    // Add the value to the header
    requestHeaders.push({"Key": key, "Value": value});
}

function ViewModel() {
    var self = this;
    self.contacts = ko.observableArray();
    self.responseHeaders = ko.observableArray();
    self.requestHeaders = ko.observableArray();
    self.requestBody = ko.observable();
    self.responseBody = ko.observable();
    self.showImage = ko.observable(false);
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
    this.addResponseHeader = function (responseHeader) {
        self.responseHeaders.unshift(responseHeader);
    };
    this.clearResponseHeaders = function() {
        self.responseHeaders.removeAll();
    }
    self.addRequestHeaders = function (requestHeaders) {
        for (var requestHeaderIndex in requestHeaders) {
            self.addRequestHeader(requestHeaders[requestHeaderIndex]);
        }
    };
    this.addRequestHeader = function (requestHeader) {
        self.requestHeaders.unshift(requestHeader);
    };
    this.clearRequestHeaders = function() {
        self.requestHeaders.removeAll();
    }
    this.empty = function() {
    	self.contacts.removeAll();
    };
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
        if(key || value)
    		headers.push({"Key": key, "Value": value});
	}
	return headers;
}

$(function()
{
	var model = new ViewModel();
    ko.applyBindings(model);

    $(".example .submit").click(function() {
        model.requestBody("");
        model.responseBody("");
        model.empty();
        model.clearResponseHeaders();
        model.clearRequestHeaders();
        var button = $(this);
        var container = button.parents(".example");
        var imageContainer = container.find(".image-container");
        imageContainer.hide();
        var img = container.find(".contact-image");
        var url = container.find(".request .url")[0];
        var contentType = container.find(".request .content-type")[0];
        if(contentType.value === "image/jpg") {
            handleImageRequest(imageContainer, contentType, url);
        }
        else {
            handleRegularRequest(container, contentType, url);
        }
    });

    var handleImageRequest = function(imageContainer, contentType, url) {
        var img = $("<img />").bind("load",function(x, y, z) {
                if (!this.complete || 
                    typeof this.naturalWidth == "undefined" || 
                    this.naturalWidth == 0) {
                        alert('broken image!');
                } else {
                    imageContainer.html(img);
                    imageContainer.fadeIn();
                }
            }).attr("src", url.value);
    }

    var handleRegularRequest = function(container, contentType, url) {
        var body = container.find(".request .body")[0];
        body = jQuery.trim(body.value);
        var method = container.find(".request .method")[0];
        requestHeaders = null;
        var request = $.ajax({
            headers: { 
                Accept : contentType.value,
                "Content-Type": "application/json; charset=utf-8"
            },
            url: url.value,
            type: method.value,
            data: body
        })
        .done(function(response, status, jqXHR) {
            if (response instanceof Array) {
                model.addContacts(response);
            }
            if (response instanceof Object && response.Id !== undefined) {
                model.addContact(response);
            }
            handleXHR(jqXHR);
        })
        .fail(function(jqXHR, status, resObj) {
            handleXHR(jqXHR);
        });
        model.addRequestHeaders(requestHeaders);
        model.requestBody(body);
    }

    var handleXHR = function(jqXHR) {
        var headers = readHeaders(jqXHR);
        headers.push({"Key": "Status code", "Value": jqXHR.status})
        headers.push({"Key": "Status text", "Value": jqXHR.statusText})
        model.addResponseHeaders(headers);
        model.responseBody(jqXHR.responseText);                
    }

    $(".tabs a").click(function(evt) {
        evt.preventDefault();
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

    $(".insertSample").click(function(evt) {
        evt.preventDefault();
        var link = $(this);
        var container = link.parents(".request");
        var exampleJson = '{FirstName: "Tomas", LastName: "Jansson", PhoneNumber: "123123123", Address:"Street", City:"Oslo", Zip: "1234", Email: "some@address.com"}';
        container.find(".body").val(exampleJson);
    });
});
