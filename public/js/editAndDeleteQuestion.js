document.addEventListener("DOMContentLoaded", () => {
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  const editForm = document.getElementById("editForm");
  const editText = document.getElementById("editText");
  const editFile = document.getElementById("editFile");
  const editPreview = document.getElementById("editPreview");
  const editId = document.getElementById("editId");
  const editType = document.getElementById("editType");
  const editIsCorrect = document.getElementById("editIsCorrect");
  const correctToggleWrapper = document.getElementById("correctToggleWrapper");
  const existingImage = document.getElementById("existingImage");
  const editModalLabel = document.getElementById("editModalLabel");
  const removeImage = document.getElementById("removeImage");
  const removeImageBtn = document.getElementById("removeImageBtn");
  // Reset preview on file select
  editFile.addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        editPreview.src = ev.target.result;
        editPreview.classList.remove("d-none");
        removeImageBtn.classList.remove("d-none");
        removeImage.value = "false"; // new file overrides removal
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle "Remove Image" click
  removeImageBtn.addEventListener("click", () => {
    editPreview.src = "";
    editPreview.classList.add("d-none");
    editFile.value = "";
    existingImage.value = "";
    removeImage.value = "true"; // mark for deletion
    removeImageBtn.classList.add("d-none");
  });

  // Open modal for Question
  document.querySelectorAll(".edit-question-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.questionId;
      const textEl = document.getElementById(`question-text-${id}`);
      const text = textEl.textContent.trim();

      const imgEl = document.querySelector(`#question-${id}-image`);
      const imageUrl = imgEl ? imgEl.src : "";

      editId.value = id;
      editType.value = "question";
      editText.value = text;
      editModalLabel.textContent = "Edit Question"; // ✅ dynamic title
      removeImage.value = "false";


      if (imageUrl) {
        editPreview.src = imageUrl;
        editPreview.classList.remove("d-none");
        existingImage.value = imageUrl;
        removeImageBtn.classList.remove("d-none");

      } else {
        editPreview.classList.add("d-none");
        existingImage.value = "";
        removeImageBtn.classList.add("d-none");

      }

      correctToggleWrapper.classList.add("d-none"); // Hide toggle for questions
      editFile.value = "";
      editModal.show();
    });
  });

  // Open modal for Option
  document.querySelectorAll(".edit-option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.optionId;
      const li = document.querySelector(`#option_${id}`).closest("li");
      const labelEl = li.querySelector("label");
      const text = labelEl.textContent.replace("(Correct)", "").trim();
      const imgEl = li.querySelector("img");
      const imageUrl = imgEl ? imgEl.src : "";

      const isCorrect = labelEl.textContent.includes("(Correct)");

      editId.value = id;
      editType.value = "option";
      editText.value = text;
      editIsCorrect.checked = isCorrect;
      editModalLabel.textContent = "Edit Option"; // ✅ dynamic title
      removeImage.value = "false";

      if (imageUrl) {
        editPreview.src = imageUrl;
        editPreview.classList.remove("d-none");
        existingImage.value = imageUrl;
        removeImageBtn.classList.remove("d-none");

      } else {
        editPreview.classList.add("d-none");
        existingImage.value = "";
        removeImageBtn.classList.add("d-none");

      }

      correctToggleWrapper.classList.remove("d-none"); // Show toggle for options
      editFile.value = "";
      editModal.show();
    });
  });

  // Handle update form submission
  editForm.addEventListener("submit", async e => {
    e.preventDefault();

    const id = editId.value;
    const type = editType.value;
    const text = editText.value.trim();
    const file = editFile.files[0];
    const isCorrect = editIsCorrect.checked;

    if (!text) return alert("Text cannot be empty");

    const formData = new FormData();
    formData.append(type === "question" ? "question_text" : "option_text", text);

    if (file) {
      formData.append(type === "question" ? "question_image" : "option_image", file);
    } else if (removeImage.value === "true") {
      formData.append("remove_image", "true"); // tell backend to delete
    } else if (existingImage.value) {
      formData.append("existingImage", existingImage.value); // keep current image
    }

    if (type === "option") {
      formData.append("is_correct", isCorrect ? 1 : 0); // ✅ send as 1 or 0
    }

    try {
      const url = type === "question"
        ? `https://pdf-files-production.up.railway.app/admin/questions/${id}/update`
        : `https://pdf-files-production.up.railway.app/admin/options/${id}/update`;

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Update failed");

      // ✅ Update DOM
      if (type === "question") {
        document.getElementById(`question-text-${id}`).textContent = data.newText;

        let imgEl = document.querySelector(`#question-${id}-image`);
        if (data.removeImage) {
          if (imgEl) imgEl.remove(); console.log("imgEl removed", imgEl);
        } else if (data.newImage) {
          if (!imgEl) {
            imgEl = document.createElement("img");
            imgEl.id = `question-${id}-image`;
            imgEl.className = "img-fluid mt-2";
            document.getElementById(`question-text-${id}`).after(imgEl);
          }
          imgEl.src = data.newImage;
        }
      } else {
        const li = document.querySelector(`#option_${id}`).closest("li");
        const labelEl = li.querySelector("label");
        labelEl.textContent = `${data.option_text} ${data.is_correct ? "(Correct)" : ""}`;

        let imgEl = li.querySelector("img");
        if (data.removeImage) {
          if (imgEl) imgEl.remove();
        } else if (data.newImage) {
          if (!imgEl) {
            imgEl = document.createElement("img");
            imgEl.className = "img-fluid mt-2";
            labelEl.after(imgEl);
          }
          imgEl.src = data.newImage;
        }
      }

      // ✅ Reset modal after update
      editForm.reset();
      editPreview.classList.add("d-none");
      correctToggleWrapper.classList.add("d-none");
      editModal.hide();

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  });



  document.querySelectorAll(".delete-question").forEach(form => {
    form.addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent full-page reload

      const questionId = this.getAttribute("data-question-id");
      const actionUrl = this.getAttribute("action"); // Get API endpoint

      const response = await fetch(actionUrl, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: questionId })
      });

      if (response.ok) {
        document.getElementById(`question_${questionId}`).closest("li").remove(); // Correct selector
      } else {
        const result = await response.json();
        alert("Error: " + result.message); // Show error if deletion fails
      }
    });
  });


  // Option Edit and Delete functionality
  document.querySelectorAll(".delete-option").forEach(form => {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const optionId = this.getAttribute("data-option-id");
      const actionUrl = this.getAttribute("action");

      const response = await fetch(actionUrl, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: optionId })
      });

      if (response.ok) {
        // Find the option element and remove it
        document.querySelector(`#option_${optionId}`).closest("li").remove();
      } else {
        const result = await response.json();
        alert("Error: " + result.message);
      }
    });
  });
});