// SITEMAP AND INIT
try {
  (function () {
    
    /**
     * Identity Event
     * Attached to window to be accessible by HTML onsubmit
     */
    window.submitAuthForm = function() {
        console.log('Authentication event triggered');
        const form = document.getElementById("authenticationForm");
        if (!form) return;
        
        const inputs = form.elements;
		

        
        SalesforceInteractions.sendEvent({
            user: {
                attributes: {
                    eventType: 'identity',
                    sourcePageType: window.location.href,
                    isAnonymous: 0 // Set to 0 to trigger Identity Resolution in Data Cloud
                }
            }
        });

        /* Party Id event */
        SalesforceInteractions.sendEvent({
            user: {
                attributes: {
                    eventType: 'partyIdentification',
                    IDName: "WebUser",
                    IDType: "Web",
                    userId: inputs["login"].value
                }
            }
        });
	
        /* Contact Point Email event */
        SalesforceInteractions.sendEvent({
            user: {
                attributes: {
                    eventType: 'contactPointEmail',
                    email: inputs["login"].value
                }
            }
        });

        window.hideAuthForm();
        return false; // Prevent page refresh
    };

    window.submitRegisterForm = function() {
        console.log('Registration event triggered');
        const form = document.getElementById("registerForm");
        if (!form) return;
        
        const inputs = form.elements;
        
        SalesforceInteractions.sendEvent({
            user: {
                attributes: {
                    eventType: 'identity',
                    firstName: inputs["firstname"].value,
                    lastName: inputs["lastname"].value,
                    sourcePageType: window.location.href,
                    isAnonymous: 0 // Set to 0 to trigger Identity Resolution in Data Cloud
                }
            }
        });

        /* Party Id event */
        SalesforceInteractions.sendEvent({
            user: {
                attributes: {
                    eventType: 'partyIdentification',
                    IDName: "WebUser",
                    IDType: "Web",
                    userId: inputs["username"].value
                }
            }
        });
	
        /* Contact Point Email event */
        SalesforceInteractions.sendEvent({
            user: {
                attributes: {
                    eventType: 'contactPointEmail',
                    email: inputs["email"].value
                }
            }
        });

        window.hideRegisterForm();
        return false; // Prevent page refresh
    };

    /**
     * UI Helpers
     * Attached to window to be accessible by HTML onclick
     */
    window.displayAuthForm = function() {
        const form = document.getElementById("loginform");
        if (form) form.style.visibility = "visible";
    };

    window.hideAuthForm = function() {
        const form = document.getElementById("loginform");
        if (form) form.style.visibility = "hidden";
    };
	
    window.displayRegisterForm = function() {
        const form = document.getElementById("registerform");
        if (form) form.style.visibility = "visible";
    };

    window.hideRegisterForm = function() {
        const form = document.getElementById("registerform");
        if (form) form.style.visibility = "hidden";
    };


    window.addToCart = function() {
        SalesforceInteractions.sendEvent({
            interaction: {
                name: "Add To Cart",
                lineItem: {
                    catalogObjectType: "Product",
                    catalogObjectId: getProductId(),
                    quantity: 1,
                    price: getProductPrice(),
                    currency: "USD"
                }
            }
        });
    };

    // ----------------------------
    // Helpers & utility functions
    // ----------------------------

    function getPageName() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        if (segments.length === 0) return "Homepage";

        const cleanedSegments = segments.map(segment => {
            const withoutExt = segment.replace('.html', '');
            return withoutExt
                .split(/[^a-zA-Z0-9]+/)
                .map((word, index) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('');
        });
        return cleanedSegments.join('_').slice(0, 80);
    }

    function getPageCategory() {
        const segments = window.location.pathname.split('/').filter(Boolean);
        return segments[0] || 'home';
    }

    // Product ID__c / Price__c from Product__dlm, set on <main data-product-id data-product-price>
    function getProductData(key) {
        const el = document.querySelector("[data-product-id]");
        return el ? el.dataset[key] : undefined;
    }

    function getProductId() {
        return getProductData("productId");
    }

    function getProductPrice() {
        return parseFloat(getProductData("productPrice")) || 0;
    }

    function getProductTitle() {
        try { return document.getElementsByClassName("product-description")[0].getElementsByTagName("h1")[0].innerText; }
        catch { return ""; }
    }

    function getProductDescription() {
        try { return document.getElementsByClassName("product-description")[0].getElementsByTagName("p")[0].innerText; }
        catch { return ""; }
    }

    /**
     * Initialization Logic
     */
    window.onload = function() {
        SalesforceInteractions.setLoggingLevel('debug');

        SalesforceInteractions.init({
            // cookieDomain is set to empty for localhost/IP testing
            cookieDomain: window.location.hostname.includes(".") ? window.location.hostname.replace('www.', '') : "", 
            consents: [
                {
                    provider: "ConsentProvider",
                    purpose: SalesforceInteractions.ConsentPurpose.Tracking,
                    status: SalesforceInteractions.ConsentStatus.OptIn
                }
            ],
            personalization: {
                dataspace: "default", // Matches your custom Data Space
            },
        }).then(() => {
            console.log('Interactions WebSDK initialized in WebRealTime dataspace');

            SalesforceInteractions.Personalization.Config.initialize({});

            const config = {
                global: {
                    contentZones: ["div#hero-image"]
                },
                pageTypes: [
                    {
                        name: "product",
                        isMatch: () => !!getProductId(),
                        interaction: {
                            name: "View Catalog Object",
                            catalogObject: {
                                type: "Product",
                                id: getProductId(),
                                attributes: {
                                    description: getProductDescription(),
                                    name: getProductTitle()
                                }
                            }
                        }
                    },
                    {
                        name: "default_page",
                        isMatch: () => true,
                        interaction: {
                            name: getPageName(),
                            eventType: "PageView"
                        }
                    }
                ]
            };

            SalesforceInteractions.initSitemap(config);
        }).catch((err) => {
            console.error("SDK Initialization failed:", err);
        });
    };

  })()
} catch (e) {
  console.error("[Salesforce Data Cloud] Error loading sitemap:", e);
}