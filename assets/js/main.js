        const contactForm = document.getElementById('portfolio-contact-form');
        const feedback = document.getElementById('form-feedback');
        const submitBtn = document.getElementById('submit-btn');
        const btnText = document.getElementById('btn-text');

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Set Loading state
            submitBtn.disabled = true;
            btnText.innerText = "Sending...";
            feedback.style.display = "block";
            feedback.className = "mt-3 text-center small text-muted";
            feedback.innerText = "Processing your message...";

            const formData = new FormData(contactForm);
            const googleFormUrl = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSci_pGVeNmUDdiWoV4moV5ekmgfNTltRzCzGQScptIsGrg4Jw/formResponse";

            try {
                // We use no-cors mode because Google Forms doesn't support CORS requests for direct formResponse submissions
                // This means the browser won't let us see the 'success' response, but it still sends the data.
                await fetch(googleFormUrl, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors'
                });

                // Since we can't read the response in no-cors, we assume success if no error was thrown
                feedback.className = "mt-3 text-center small text-success";
                feedback.innerHTML = "<i class='bi bi-check-circle-fill'></i> Message sent successfully!";
                contactForm.reset();
            } catch (error) {
                console.error('Submission error:', error);
                feedback.className = "mt-3 text-center small text-danger";
                feedback.innerText = "Error sending message. Please try again.";
            } finally {
                submitBtn.disabled = false;
                btnText.innerText = "Send Message";
            }
        });