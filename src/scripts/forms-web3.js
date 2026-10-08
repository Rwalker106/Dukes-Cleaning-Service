const WEB3_ENDPOINT = "https://api.web3forms.com/submit";

function setFormStatus(formKey, message, isError = false) {
  const statusEl = document.querySelector(`[data-form-status="${formKey}"]`);
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
  statusEl.classList.toggle("is-success", !isError && message.length > 0);
}

async function handleSubmit(event, form, formKey) {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = true;
  }

  setFormStatus(formKey, "Submitting...");

  try {
    const formData = new FormData(form);
    const response = await fetch(WEB3_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    const data = await response.json();
    if (response.ok && data.success) {
      form.reset();
      setFormStatus(
        formKey,
        "Thanks. Your request has been submitted successfully.",
      );
    } else {
      setFormStatus(
        formKey,
        data.message || "Submission failed. Please try again.",
        true,
      );
    }
  } catch (_error) {
    setFormStatus(
      formKey,
      "Network error. Please try again in a moment.",
      true,
    );
  } finally {
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = false;
    }
  }
}

function initWeb3Form(formId, formKey) {
  const form = document.getElementById(formId);
  if (!(form instanceof HTMLFormElement)) return;

  form.addEventListener("submit", (event) => {
    handleSubmit(event, form, formKey);
  });
}

initWeb3Form("quick-quote-form", "quick-quote");
initWeb3Form("detailed-rfp-form", "detailed-rfp");
