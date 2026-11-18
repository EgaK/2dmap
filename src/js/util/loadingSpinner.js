import $ from "./tiny";

const loadingSpinner = $("#ld")[0];

const show = (source = $("body")) => {
  loadingSpinner.showPopover({ source: source[0] });
};

const hide = () => {
  loadingSpinner.hidePopover();
};

export default { show, hide };
