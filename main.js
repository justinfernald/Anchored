var Anchored = function (root, options) {
    var df = function (v, d) {
        return typeof v !== 'undefined' ? v : d;
    }
    this.root = root;
    var options = options || {};
    this.options = {
        showLinks: df(options.showLinks, true),
        time: df(options.time, 700),
        increment: df(options.increment, 25),
        offset: df(options.offset, 90),
        spoilerIdentifier: df(options.spoilerIdentifier, (function (element) {
            return element.classList.contains("panel-default");
        }).bind(this)),
        findActivator: df(options.findActivator, (function (x) {
            return x.children[0].children[0].children[0];
        }).bind(this))
    };
    this.anchors = [];
    this.Anchor = function (element) {
        this.element = element;
        this.hovered = false;
        this.linkHovered = false;
        this.linkShown = false;
        this.linkModal;
        this.linkModalBackground;
        this.linkModalShown = false;

        element.addEventListener("mouseenter", function (e) {
            this.hovered = true;
            this.updateLink();
        }.bind(this));

        element.addEventListener("mouseleave", function (e) {
            this.hovered = false;
            this.updateLink();
        }.bind(this));

        this.getAnchor = function () {
            return this.element.getAttribute("anchor");
        };

        this.showLinkModal = function (link) {
            this.linkModalBackground = document.createElement("div");
            this.linkModalBackground.style.left = 0;
            this.linkModalBackground.style.top = 0;
            this.linkModalBackground.style.right = 0;
            this.linkModalBackground.style.bottom = 0;
            this.linkModalBackground.style.position = "fixed";
            this.linkModalBackground.style.backgroundColor = "#fff";
            this.linkModalBackground.style.opacity = 0.7;
            document.body.appendChild(this.linkModalBackground);
            this.linkModalBackground.addEventListener("click", function(e) {
                this.hideLinkModal();
            }.bind(this));

            this.linkModal = document.createElement("div");
            this.linkModal.innerHTML = "<p>Link was copied!</p><p style=\"padding: 4px; border-radius: 4px; border: 1px solid #000\"><a style=\"overflow-wrap: break-word;\" href=\"" + link + "\" target=\"_blank\">" + link + "</p>"
            this.linkModal.style.position = "fixed";
            this.linkModal.style.left = "50%";
            this.linkModal.style.top = "50%";
            this.linkModal.style.maxWidth = "90%";
            this.linkModal.style.transform = "translate(-50%, -50%)";
            this.linkModal.style.padding = "10px";
            this.linkModal.style.backgroundColor = "#fff";
            this.linkModal.style.borderRadius = "7px";
            this.linkModal.style.border = "1px solid #666";
            document.body.appendChild(this.linkModal);
        };

        this.hideLinkModal = function () {
            this.linkModalShown = false;
            document.body.removeChild(this.linkModalBackground);
            document.body.removeChild(this.linkModal);
        };

        this.showLink = function () {
            document.body.appendChild(this.linkElement);
            this.updateLinkLocation();
        };

        this.updateLinkLocation = function () {
            var boundBox = this.element.getBoundingClientRect();
            this.linkElement.style.right = document.documentElement.clientWidth - boundBox.right + pageXOffset + "px";
            this.linkElement.style.top = boundBox.top + pageYOffset + "px";
        }.bind(this);

        this.hideLink = function () {
            try {
            document.body.removeChild(this.linkElement);
            } catch (e) {}
        }.bind(this);

        this.updateLink = function() {
            setTimeout(function() {
                if (this.linkHovered || this.hovered) {
                    if (!this.linkShown) {
                        this.showLink();
                        this.linkShown = true;
                    }
                } else {
                    this.hideLink();
                    this.linkShown = false;
                }
            }.bind(this), 25);
        }.bind(this);

        this.linkElement = document.createElement("div");
        this.linkElement.style.position = "absolute";
        this.linkElement.style.padding = "15px";
        this.linkElement.style.borderRadius = "15px";
        this.linkElement.style.border = "1px solid #ddd3"
        this.linkElement.style.backgroundColor = "#eee";
        this.linkElement.style.display = "block";
        this.linkElement.style.transform = "translate(30%, -30%)";
        this.linkElement.style.cursor = "pointer";
        this.linkElement.innerHTML = "<i style=\"color: black; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);\" class=\"material-icons\">link</i>"

        this.linkElement.addEventListener("mouseenter", function (e) {
            this.linkHovered = true;
            this.element.style.transition = "0.4s ease-in-out";
            this.element.style.borderRadius = "4px";
            this.element.style.boxShadow = "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)";
            this.updateLink()
        }.bind(this));

        this.linkElement.addEventListener("mouseleave", function (e) {
            this.linkHovered = false;
            this.element.style.borderRadius = "";
            this.element.style.boxShadow = "";
            this.element.style.transition = "";
            this.updateLink();
        }.bind(this));

        this.linkElement.addEventListener("click", function (e) {
            var anchorLink = location.origin + location.pathname + "#" + this.getAnchor();

            function fallbackCopyTextToClipboard(text) {
                var textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    var successful = document.execCommand('copy');
                    var msg = successful ? 'successful' : 'unsuccessful';
                } catch (err) {
                    console.error(err);
                }

                document.body.removeChild(textArea);
            }

            function copyTextToClipboard(text) {
                if (!navigator || !navigator.clipboard) {
                    fallbackCopyTextToClipboard(text);
                    return;
                }
                navigator.clipboard.writeText(text).then(function () {
                }, function (err) {
                    console.error(err);
                });
            }
            copyTextToClipboard(anchorLink);
            this.showLinkModal(anchorLink);
            this.linkModalShown = true;
        }.bind(this));
    };
}

Anchored.prototype.setup = function() {
    this.createAnchors();
    this.goToAnchor(this.getAnchorFromLink());
}

Anchored.prototype.getAnchorFromLink = function () {
    return window.location.hash.slice(1);
}

Anchored.prototype.goToAnchor = function (anchorID) {
    var main = function (anchorID) {
        var element = document.querySelector('[anchor="' + anchorID + '"]');
        if (!element) return;
        if (this.root) {
            var spoilers = getParentSpoilers(
                element,
                this.root,
                this.options.spoilerIdentifier
            );
            spoilers.forEach(function (spoiler) {
                return openSpoiler(spoiler, this.options.findActivator)
            }.bind(this));
        }
        smoothScrollToElement(
            element,
            this.options.time,
            this.options.increment,
            this.options.offset
        );
    }.bind(this);

    function smoothScrollToElement(
        element,
        time,
        increment,
        offset,
        curve
    ) {
        curve = curve || easeInAndOut;
        var i = 0;

        function timeStep() {
            i += increment / time;
            window.scrollTo(
                pageXOffset,
                curve(i) *
                (pageYOffset + element.getBoundingClientRect().top - offset)
            );
            if (i < 1) {
                setTimeout(timeStep.bind(this), increment);
            } else {
                window.scrollTo(
                    pageXOffset,
                    (pageYOffset + element.getBoundingClientRect().top - offset)
                );
            }
        }
        timeStep();
    }

    function easeInAndOut(t) {
        return t < 0.5 ?
            4 * t * t * t :
            (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    function getParentSpoilers(
        element,
        root,
        spoilerIdentifier,
        spoilers
    ) {
        spoilers = spoilers || [];
        if (element == root) {
            return spoilers;
        }
        if (spoilerIdentifier(element)) {
            spoilers.push(element);
        }
        return getParentSpoilers(
            element.parentNode,
            root,
            spoilerIdentifier,
            spoilers
        );
    }

    function openSpoiler(
        spoiler,
        findActivator
    ) {
        findActivator(spoiler).click();
    }

    main(anchorID);
}

Anchored.prototype.createAnchors = function () {
    var traverseTree = (function (root, identification, panel) {
        identification = identification || [];
        panel = panel || false;
        var children = root.children;
        if (children && children.length != 0)
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (!child || !child.parentNode) continue;
                if (isLinkHolder(child)) {
                    identification.push(i);
                    child.setAttribute("anchor", identification.join("-"));
                    if (this.options.showLinks)
                        this.anchors.push(new this.Anchor(child));
                    traverseTree(child, identification);
                    identification.pop();
                } else traverseTree(child, identification);
            }
    }).bind(this);

    function isLinkHolder(element) {
        if (!element.parentNode) return false;
        return getBlockElements(getSiblings(element)).length > 1;
    }

    function getBlockElements(elementArray) {
        var blockType = ["list-item", "table", "block"];
        return elementArray.filter(
            (function (x) {
                return blockType.indexOf(getComputedStyle(x).display) != -1
            }).bind(this)
        );
    }

    function getSiblings(element) {
        return [].slice.call(element.parentNode.children);
    }
    traverseTree(this.root);
};
