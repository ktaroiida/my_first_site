document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor
    const cursor = document.querySelector('.cursor');
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Reveal on Scroll
    const observerOptions = {
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-text, .reveal-up').forEach(el => {
        revealObserver.observe(el);
    });

    // Hero Text Animation
    setTimeout(() => {
        document.querySelectorAll('#hero .reveal-text').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);

    // Interest Cards Mouse Parallax
    const cards = document.querySelectorAll('.interest-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `translateY(-15px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `translateY(0) perspective(1000px) rotateX(0deg) rotateY(0deg)`;
        });
    });

    // Philosophy Background Scrolling Text
    window.addEventListener('scroll', () => {
        const phiText = document.querySelector('.phi-bg-text');
        if (phiText) {
            const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            const move = (scrollPercent * 100) - 50;
            phiText.style.transform = `translateX(${move}%)`;
        }
    });

    // Smooth Scroll for Nav Links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
