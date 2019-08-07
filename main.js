class Anchored {
    static Anchor = (class {
        constructor(element) {
            this.element = element;
            this.hovered = false;
            this.linkHovered = false;
            this.linkShown = false;
            this.linkModal;
            this.linkModalBackground;
            this.linkModalShown = false;
            element.addEventListener("mouseenter", e => {
                this.hovered = true;
                if (!this.linkShown)
                    this.showLink();
            })
            element.addEventListener("mouseleave", e => {
                this.hovered = false;
                if (!this.linkHovered)
                    this.hideLink();
            })
            this.linkElement = document.createElement("div");
            this.linkElement.style.position = "absolute";
            this.linkElement.style.padding = "15px";
            this.linkElement.style.borderRadius = "15px";
            this.linkElement.style.border = "1px solid #ddd3"
            this.linkElement.style.backgroundColor = "#eee3";
            this.linkElement.style.display = "block";
            this.linkElement.style.transform = "translate(30%, -30%)";
            this.linkElement.style.cursor = "pointer";
            this.linkElement.innerHTML = `<i style="color: black; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);" class="material-icons">link</i>`


            this.linkElement.addEventListener("mouseenter", e => {
                this.linkHovered = true;
                this.element.style.transition = "0.4s ease-in-out";
                this.element.style.borderRadius = "4px";
                this.element.style.boxShadow = "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)";

                if (!this.linkShown)
                    this.showLink();
            });
            this.linkElement.addEventListener("mouseleave", e => {
                this.linkHovered = false;
                this.element.style.borderRadius = "";
                this.element.style.boxShadow = "";
                this.element.style.transition = "";

                if (!this.linkHovered)
                    this.hideLink();
            });
            this.linkElement.addEventListener("click", e => {
                const anchorLink = location.origin + location.pathname + "#" + this.getAnchor();
                Anchored.copyTextToClipboard(anchorLink);
                this.showLinkModal(anchorLink);
                this.linkModalShown = true;
            });
        }

        getAnchor() {
            return this.element.getAttribute("anchor");
        }

        showLinkModal(link) {
            this.linkModalBackground = document.createElement("div");
            this.linkModalBackground.style.left = 0;
            this.linkModalBackground.style.top = 0;
            this.linkModalBackground.style.position = "fixed";
            this.linkModalBackground.style.width = "100%";
            this.linkModalBackground.style.height = "100%";
            this.linkModalBackground.style.backgroundColor = "#fffd";
            document.body.appendChild(this.linkModalBackground);
            this.linkModalBackground.addEventListener("click", e => {
                this.hideLinkModal();
            });

            this.linkModal = document.createElement("div");
            this.linkModal.innerHTML = "<p>Link was copied!</p><p style=\"padding: 4px; border-radius: 4px; border: 1px solid #000\"><a style=\"overflow-wrap: break-word;\" href=\"" + link + "\" target=\"_blank\">" + link + "</p>"
            this.linkModal.style.position = "fixed";
            this.linkModal.style.left = "50%";
            this.linkModal.style.top = "50%";
            this.linkModal.style.maxWidth = "90%";
            this.linkModal.style.transform = "translate(-50%, -50%)";
            this.linkModal.style.padding = "10px";
            this.linkModal.style.backgroundColor = "#fffe";
            this.linkModal.style.borderRadius = "7px";
            this.linkModal.style.border = "1px solid #0005";
            document.body.appendChild(this.linkModal);
        }

        hideLinkModal() {
            this.linkModalShown = false;
            document.body.removeChild(this.linkModalBackground);
            document.body.removeChild(this.linkModal);
        }

        showLink() {
            document.body.appendChild(this.linkElement);
            this.updateLinkLocation();
        }

        updateLinkLocation = () => {
            let boundBox = this.element.getBoundingClientRect();
            this.linkElement.style.right = document.documentElement.clientWidth - boundBox.right + scrollX + "px";
            this.linkElement.style.top = boundBox.top + scrollY + "px";
        }

        hideLink = () => {
            document.body.removeChild(this.linkElement);
        }
    });

    static anchors = [];

    static init(
        root,
        showLinks,
        options = {
            time: 700,
            increment: 25,
            offset: 90,
            spoilerIdentifier: element =>
                element.classList.contains("panel-default"),
            findActivator: x => x.children[0].children[0].children[0]
        }
    ) {
        this.setupDocument(root, showLinks || true); // || true is just for testing
        this.goToAnchor(window.location.hash.slice(1), root, options);
    }

    static fallbackCopyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }
    static copyTextToClipboard(text) {
        if (!navigator.clipboard) {
            Anchored.fallbackCopyTextToClipboard(text);
            return;
        }
        navigator.clipboard.writeText(text).then(function () {
            console.log('Async: Copying to clipboard was successful!');
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    }

    static goToAnchor(anchorID, root = false, options) {
        function main(anchorID, root = false, options) {
            let element = document.querySelector('[anchor="' + anchorID + '"]');
            if (!element) return;
            if (root) {
                let spoilers = getParentSpoilers(
                    element,
                    root,
                    options.spoilerIdentifier
                );
                spoilers.forEach(spoiler =>
                    openSpoiler(spoiler, options.findActivator)
                );
            }
            smoothScrollToElement(
                element,
                options.time,
                options.increment,
                options.offset
            );
        }

        async function smoothScrollToElement(
            element,
            time = 500,
            increment = 25,
            offset = 90,
            curve = easeInAndOut
        ) {
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
            for (let i = 0; i < 1; i += increment / time) {
                scrollTo(
                    scrollX,
                    easeInAndOut(i) *
                    (scrollY + element.getBoundingClientRect().y - offset)
                );
                await sleep(increment);
            }
        }

        function easeInAndOut(time) {
            let t = time;
            return t < 0.5 ?
                4 * t * t * t :
                (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        }

        function getParentSpoilers(
            element,
            root,
            spoilerIdentifier,
            spoilers = []
        ) {
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
            findActivator = x => x.children[0].children[0].children[0]
        ) {
            findActivator(spoiler).click();
        }

        main(anchorID, root, options);
    }

    static setupDocument(root, showLinks) {
        function traverseTree(root, identification = [], panel = false) {
            const children = root.children;
            if (children && children.length != 0)
                for (let i in children) {
                    let child = children[i];
                    if (!child || !child.parentNode) continue;
                    if (isLinkHolder(child)) {
                        identification.push(i);
                        child.setAttribute("anchor", identification.join("-"));
                        if (showLinks)
                            Anchored.anchors.push(new Anchored.Anchor(child));
                        traverseTree(child, identification);
                        identification.pop();
                    } else traverseTree(child, identification);
                }
        }

        function isLinkHolder(element) {
            if (!element.parentNode) return false;
            return getBlockElements(getSiblings(element)).length > 1;
        }

        function getBlockElements(elementArray) {
            const blockType = ["list-item", "table", "block"];
            return elementArray.filter(
                x => blockType.indexOf(getComputedStyle(x).display) != -1
            );
        }

        function getSiblings(element) {
            return [...element.parentNode.children];
        }

        traverseTree(root);
    }
}

window.onload = () => {
    Anchored.init(
        document.querySelector(
            "#article-container > div > article > section > div > div"
        ),
        HelpCenter.user.role != "anonymous"
    );
};