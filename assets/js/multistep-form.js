/**
 * Multi-Step Form Logic for Findox / Investors Club
 * Handles 4-page sequence with exact Google Forms specifications:
 * - Page 1: Personal Details (Section 1: Contact Information)
 * - Page 2: Profile & Background (Section 2: Background & Demographics)
 * - Page 3: Collaboration & Investment Profile (Section 3: Investment & Value Contribution)
 * - Page 4: Business Proposal & Ideas (Section 4: Business Concepts & Proposals)
 */
(function ($) {
  "use strict";

  $(document).ready(function () {
    var currentStep = 1;
    var totalSteps = 4;

    function updateStepUI(step) {
      // Hide all step cards, show targeted step
      $(".form-step-card").removeClass("active");
      $("#formCard" + step).addClass("active");

      // Update progress bar fill percentage
      var progressPercent = (step / totalSteps) * 100;
      $("#stepProgressFill").css("width", progressPercent + "%");

      // Update Step Indicators
      $(".step-indicator").each(function () {
        var indicatorStep = parseInt($(this).data("step"), 10);
        $(this).removeClass("active completed");
        if (indicatorStep < step) {
          $(this).addClass("completed");
        } else if (indicatorStep === step) {
          $(this).addClass("active");
        }
      });

      // Smooth scroll if needed on mobile
      var container = $(".contact-multistep-container");
      if (container.length && window.innerWidth < 992) {
        $("html, body").animate(
          {
            scrollTop: container.offset().top - 80,
          },
          300
        );
      }
    }

    // Toggle "Other" Educational Qualification input
    $("#userQualification").on("change", function () {
      if ($(this).val() === "Other") {
        $("#otherQualificationWrapper").removeClass("d-none");
        $("#userOtherQualification").prop("required", true).focus();
      } else {
        $("#otherQualificationWrapper").addClass("d-none");
        $("#userOtherQualification").prop("required", false).val("");
      }
    });

    // Toggle "Other" Contribution text input
    $("#checkContributionOther").on("change", function () {
      if ($(this).is(":checked")) {
        $("#contributionOtherInputWrapper").removeClass("d-none");
        $("#contributionOtherText").focus();
      } else {
        $("#contributionOtherInputWrapper").addClass("d-none");
        $("#contributionOtherText").val("");
      }
    });

    // Step-by-Step Validation
    function validateStep(step) {
      var isValid = true;
      var $currentCard = $("#formCard" + step);

      // Clean existing errors
      $currentCard.find(".field-error-feedback").remove();
      $currentCard.find(".input-has-error").removeClass("input-has-error");

      function showError($element, message) {
        $element.addClass("input-has-error");
        var container = $element.closest(".form-one__control");
        if (!container.length) {
          container = $element.closest(".form-group-block");
        }
        if (!container.find(".field-error-feedback").length) {
          container.append('<span class="field-error-feedback">' + message + "</span>");
        }
        isValid = false;
      }

      if (step === 1) {
        // Page 1: Full Name, Email, Phone
        var name = $.trim($("#userName").val());
        var email = $.trim($("#userEmail").val());
        var phone = $.trim($("#userPhone").val());

        if (!name) {
          showError($("#userName"), "Full Name is required.");
        }
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          showError($("#userEmail"), "Please enter a valid email address.");
        }
        // Phone / WhatsApp: digits and phone format
        var phoneClean = phone.replace(/[^0-9]/g, "");
        if (!phone || phoneClean.length < 8) {
          showError($("#userPhone"), "Please enter a valid Phone / WhatsApp number.");
        }
      } else if (step === 2) {
        // Page 2: Age (whole number), Highest Educational Qualification
        var ageVal = $.trim($("#userAge").val());
        var ageNum = parseInt(ageVal, 10);
        if (!ageVal || isNaN(ageNum) || ageNum < 18 || ageNum > 100 || !/^\d+$/.test(ageVal)) {
          showError($("#userAge"), "Please enter a valid whole number for age (18 to 100).");
        }

        var qualification = $("#userQualification").val();
        if (!qualification) {
          showError($("#userQualification"), "Please select your highest educational qualification.");
        } else if (qualification === "Other") {
          var otherQual = $.trim($("#userOtherQualification").val());
          if (!otherQual) {
            showError($("#userOtherQualification"), "Please specify your qualification.");
          }
        }
      } else if (step === 3) {
        // Page 3: Contribution Checkboxes, Engagement Mode, Prior Experience, Investment Capability
        var selectedContributions = $("input[name='contribution_modes[]']:checked");
        if (selectedContributions.length === 0) {
          showError($("#contributionCheckboxGroup"), "Please select at least one way you plan to invest / contribute.");
        }
        if ($("#checkContributionOther").is(":checked") && !$.trim($("#contributionOtherText").val())) {
          showError($("#contributionOtherText"), "Please specify your other contribution.");
        }

        var engagementMode = $("input[name='engagement_mode']:checked").val();
        if (!engagementMode) {
          showError($("#engagementModeGroup"), "Please select a preferred engagement mode.");
        }

        var priorExp = $.trim($("#userPriorExperience").val());
        if (!priorExp) {
          showError($("#userPriorExperience"), "Please provide your prior business & management experience.");
        }

        var investmentRange = $("input[name='investment_range']:checked").val();
        if (!investmentRange) {
          showError($("#investmentRangeGroup"), "Please select an investment capability / range.");
        }
      }

      return isValid;
    }

    // Next button clicks
    $(document).on("click", ".btn-next-step", function (e) {
      e.preventDefault();
      var targetStep = parseInt($(this).data("next"), 10);
      var currentCardStep = targetStep - 1;

      if (validateStep(currentCardStep)) {
        currentStep = targetStep;
        updateStepUI(currentStep);
      }
    });

    // Prev button clicks
    $(document).on("click", ".btn-prev-step", function (e) {
      e.preventDefault();
      var prevStep = parseInt($(this).data("prev"), 10);
      currentStep = prevStep;
      updateStepUI(currentStep);
    });

    // File Drag & Drop and Selection handler
    var $dropZone = $("#fileDropZone");
    var $fileInput = $("#proposalFileInput");
    var $fileSelectedBadge = $("#fileSelectedBadge");
    var $fileNameDisplay = $("#fileNameDisplay");

    $dropZone.on("click", function (e) {
      if (!$(e.target).is("#btnRemoveFile") && !$(e.target).closest("#btnRemoveFile").length) {
        $fileInput.trigger("click");
      }
    });

    $fileInput.on("change", function () {
      if (this.files && this.files.length > 0) {
        var file = this.files[0];
        $fileNameDisplay.text(file.name + " (" + (file.size / (1024 * 1024)).toFixed(2) + " MB)");
        $fileSelectedBadge.removeClass("d-none");
        $(".file-upload-prompt").addClass("d-none");
        $(".file-upload-hints").addClass("d-none");
      }
    });

    // Drag-over styling
    var $uploadBox = $("#fileUploadContainer");
    $uploadBox.on("dragover dragenter", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).addClass("dragover");
    });

    $uploadBox.on("dragleave dragend drop", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).removeClass("dragover");
    });

    $uploadBox.on("drop", function (e) {
      var files = e.originalEvent.dataTransfer.files;
      if (files && files.length > 0) {
        $fileInput[0].files = files;
        var file = files[0];
        $fileNameDisplay.text(file.name + " (" + (file.size / (1024 * 1024)).toFixed(2) + " MB)");
        $fileSelectedBadge.removeClass("d-none");
        $(".file-upload-prompt").addClass("d-none");
        $(".file-upload-hints").addClass("d-none");
      }
    });

    // Remove file button
    $("#btnRemoveFile").on("click", function (e) {
      e.stopPropagation();
      $fileInput.val("");
      $fileSelectedBadge.addClass("d-none");
      $(".file-upload-prompt").removeClass("d-none");
      $(".file-upload-hints").removeClass("d-none");
    });

    // Final Form Submission Handling (Page 4 submit button)
    $("#multiStepContactForm").on("submit", function (e) {
      var $form = $(this);
      var name = $("#userName").val() || "";
      var email = $("#userEmail").val() || "";
      var phone = $("#userPhone").val() || "";
      var age = $("#userAge").val() || "";
      
      var qualification = $("#userQualification").val() || "";
      if (qualification === "Other") {
        qualification = "Other: " + ($("#userOtherQualification").val() || "");
      }

      var contributions = [];
      $("input[name='contribution_modes[]']:checked").each(function () {
        var val = $(this).val();
        if (val === "Other") {
          contributions.push("Other: " + ($("#contributionOtherText").val() || "Unspecified"));
        } else {
          contributions.push(val);
        }
      });
      var contributionsStr = contributions.join(", ");

      var engagementMode = $("input[name='engagement_mode']:checked").val() || "";
      var priorExp = $("#userPriorExperience").val() || "";
      var investmentRange = $("input[name='investment_range']:checked").val() || "";
      var ideaDesc = $("#ideaDesc").val() || "";
      var fileObj = $fileInput[0].files[0];
      var fileName = fileObj ? fileObj.name : "None attached";

      var targetEmail = window.INVESTORS_CLUB_EMAIL || "saisrinivasdasari2003@gmail.com";
      var emailSubject = "New Collaboration & Investment Profile Submission from " + (name || "Candidate");

      // Update hidden subject
      $("#formSubject").val(emailSubject);

      var emailBodyLines = [
        "========================================",
        "PAGE 1: CONTACT INFORMATION",
        "========================================",
        "• Full Name: " + name,
        "• Email Address: " + email,
        "• Phone / WhatsApp: " + phone,
        "",
        "========================================",
        "PAGE 2: BACKGROUND & DEMOGRAPHICS",
        "========================================",
        "• Age: " + age,
        "• Highest Qualification: " + qualification,
        "",
        "========================================",
        "PAGE 3: INVESTMENT & VALUE CONTRIBUTION",
        "========================================",
        "• Contribution Mode(s): " + contributionsStr,
        "• Preferred Engagement Mode: " + engagementMode,
        "• Prior Business & Leadership Experience:",
        priorExp,
        "• Investment Capability / Range: " + investmentRange,
        "",
        "========================================",
        "PAGE 4: BUSINESS CONCEPTS & PROPOSALS",
        "========================================",
        "• Business Idea Overview / Concept Description:",
        (ideaDesc ? ideaDesc : "None provided"),
        "• Attached File: " + fileName,
        "",
        "----------------------------------------",
        "Submitted via Investors Club Digital Web Portal"
      ];

      var emailBody = emailBodyLines.join("\n");
      $("#formFullSummary").val(emailBody);

      var $result = $form.parent().find(".result");
      var $btn = $("#submitMultiStepForm");

      // UI Submitting state
      $btn.prop("disabled", true).css("opacity", "0.7");
      $result.html(
        '<div class="alert alert-info" style="background:#f0f7ff; color:#0b3a75; border-color:#bcd9f8; border-radius:16px; padding:20px;">' +
          '<h5 style="color:#0b3a75; font-weight:700; margin-bottom:5px;"><i class="fas fa-spinner fa-spin me-2"></i> Submitting your proposal with attached file...</h5>' +
          '<p style="margin-bottom:0; font-size:14px;">Please wait while your complete profile and attached document are delivered to our inbox.</p>' +
        '</div>'
      );

      // Listen for the iframe load to confirm submission
      var $iframe = $("#formSubmitSink");
      var submissionHandled = false;

      function onSubmissionFinished() {
        if (submissionHandled) return;
        submissionHandled = true;

        $btn.prop("disabled", false).css("opacity", "1");
        $result.html(
          '<div class="alert alert-success" style="background:#e8f8f0; color:#006654; border-color:#a3e0c7; border-radius:16px; padding:22px; box-shadow: 0 10px 25px rgba(0,102,84,0.1);">' +
            '<h5 style="color:#006654; font-weight:700; margin-bottom:8px;"><i class="fas fa-check-circle me-2"></i> Application Submitted Successfully!</h5>' +
            '<p style="margin-bottom:0; font-size:14px;">Thank you, <strong>' + name + '</strong>. Your complete profile, proposal, and attached file (<strong>' + fileName + '</strong>) have been delivered to our inbox (<strong>' + targetEmail + '</strong>). Our committee will review your submission and connect with you shortly.</p>' +
          '</div>'
        );

        $form[0].reset();
        $("#fileSelectedBadge").addClass("d-none");
        $(".file-upload-prompt").removeClass("d-none");
        $(".file-upload-hints").removeClass("d-none");
        $("#otherQualificationWrapper").addClass("d-none");
        $("#contributionOtherInputWrapper").addClass("d-none");
        // Reset to Step 1
        $(".form-step-card").removeClass("active");
        $("#formCard1").addClass("active");
        $(".step-indicator").removeClass("active").removeClass("completed");
        $('.step-indicator[data-step="1"]').addClass("active");
        $("#stepProgressFill").css("width", "25%");
      }

      $iframe.one("load", function () {
        onSubmissionFinished();
      });

      // Safety timeout in case cross-origin iframe load is throttled
      setTimeout(function () {
        onSubmissionFinished();
      }, 4000);

      // Allow form to submit natively to the iframe target
      return true;
    });
  });
})(jQuery);
