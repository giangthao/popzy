const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

Modal.elements = [];

function Modal(options = {}) {
  const { templateId, destroyOnClose = true, footer = false, cssClass = [], closeMethods = ["button", "overlay", "escape"], onOpen, onClose } = options;
  const template = $(`#${templateId}`);

  if (!template) {
    console.error(`#${templateId} does not exist`);
    return;
  }

  this._allowBackdropClose = closeMethods.includes("overlay");
  this._allowButtonClose = closeMethods.includes("button");
  this._allowEscapeClose = closeMethods.includes("escape");

  this._getScrollbarWidth = () => {
    if (this._scrollbarWidth) return this._scrollbarWidth;
    const div = document.createElement("div");
    Object.assign(div.style, {
      overflow: "scroll",
      position: "absolute",
      top: "-9999px",
    });
    document.body.appendChild(div);
    this._scrollbarWidth = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    return this._scrollbarWidth;
  };

  this._build = () => {
    const content = template.content.cloneNode(true);

    this._backdrop = document.createElement("div");
    this._backdrop.className = "modal-backdrop";

    const container = document.createElement("div");
    container.className = "modal-container";

    cssClass.forEach((className) => {
      if (typeof className === "string") {
        container.classList.add(className);
      }
    });

    if (this._allowButtonClose) {
      const closeBtn = this._createButton("&times;", "modal-close", this.close);
      container.append(closeBtn);
    }

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";

    //Append content and elements
    modalContent.append(content);
    container.append(modalContent);

    if (footer) {
      this._modalFooter = document.createElement("div");
      this._modalFooter.className = "modal-footer";
      this._renderFooterContent();

      this._renderFooterButton();
      container.append(this._modalFooter);
    }

    this._backdrop.append(container);
    document.body.append(this._backdrop);
  };

  this.setFooterContent = (html) => {
    this._footerContent = html;
    this._renderFooterContent();
  };

  this._footerButtons = [];

  this.addFooterButton = (title, cssClass, callback) => {
    const button = this._createButton(title, cssClass, callback);
    this._footerButtons.push(button);
    this._renderFooterButton();
  };

  this._renderFooterContent = () => {
    if (this._modalFooter && this._footerContent) {
      this._modalFooter.innerHTML = this._footerContent;
    }
  };

  this._renderFooterButton = () => {
    if (this._modalFooter) {
      this._footerButtons.forEach((button) => {
        this._modalFooter.append(button);
      });
    }
  };

  this._createButton = (title, cssClass, callback) => {
    const button = document.createElement("button");
    button.className = cssClass;
    button.innerHTML = title;
    button.onclick = callback;
    return button;
  };

  this.open = () => {
    Modal.elements.push(this);
    if (!this._backdrop) {
      this._build();
    }

    setTimeout(() => {
      this._backdrop.classList.add("show");
    }, 0);

    //Attack event listeners
    if (this._allowBackdropClose) {
      this._backdrop.onclick = (e) => {
        if (e.target === this._backdrop) {
          this.close();
        }
      };
    }

    if (this._allowEscapeClose) {
      document.addEventListener("keydown", this._handleEscapeKey);
    }

    // Disable scrolling
    document.body.classList.add("no-scroll");
    document.body.style.paddingRight = this._getScrollbarWidth() + "px";

    this._onTransitionEnd(onOpen);

    return this._backdrop;
  };

  this._handleEscapeKey = (e) => {
    const lastModal = Modal.elements[Modal.elements.length - 1];
    if (e.key === "Escape" && this === lastModal) {
      this.close();
    }
  };

  this._onTransitionEnd = (callback) => {
    this._backdrop.ontransitionend = (e) => {
      if (e.propertyName !== "transform") return;
      if (typeof callback === "function") callback();
    };
  };

  this.close = (destroy = destroyOnClose) => {
    Modal.elements.pop();
    this._backdrop.classList.remove("show");

    if (this._allowEscapeClose) {
      document.removeEventListener("keydown", this._handleEscapeKey);
    }

    this._onTransitionEnd(() => {
      if (destroy && this._backdrop) {
        this._backdrop.remove();
        this._backdrop = null;
        this._modalFooter = null;
      }

      // Enable scrolling
      if (!Modal.elements.length) {
        document.body.classList.remove("no-scroll");
        document.body.style.paddingRight = "";
      }

      if (typeof onClose === "function") {
        onClose();
      }
    });
  };

  this.destroy = () => {
    this.close(true);
  };
}

const modal1 = new Modal({
  templateId: "modal-1",
  //   closeMethods: ['escape'],
  destroyOnClose: false,
});

$("#open-modal-1").onclick = () => {
  modal1.open();
};

const modal2 = new Modal({
  templateId: "modal-2",
  footer: true,
  cssClass: ["class1", "class2", "classN"],
  onOpen: () => {
    console.log("Modal opened");
  },
  onClose: () => {
    console.log("Modal closed");
  },
});

$("#open-modal-2").onclick = () => {
  const modalElement = modal2.open();
  const form = modalElement.querySelector("#login-form");
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = {
        email: $("#email").value.trim(),
        password: $("#password").value.trim(),
      };
      console.log(formData);
    };
  }
};

const modal3 = new Modal({
  templateId: "modal-3",
  closeMethods: ["escape"],
  footer: true,
  onOpen: () => {
    console.log("Open modal 3");
  },
  onClose: () => {
    console.log("Close modal 3");
  },
});

// modal3.setFooterContent(`
//     <p>Footer </p>
// `)

modal3.addFooterButton("Danger", "modal-btn danger pull-left", (e) => {
  console.log(e);
  console.log("Danger button clicked");
});

modal3.addFooterButton("Cancel", "modal-btn", (e) => {
  console.log(e);
  modal3.close();
});

modal3.addFooterButton("<span>Agree</span>", "modal-btn primary", (e) => {
  console.log(e);
  console.log("Agree button clicked");
});

$("#open-modal-3").onclick = () => {
  modal3.open();
};
