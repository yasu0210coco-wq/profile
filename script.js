import * as THREE from 'three';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* =========================================
   Mobile Navigation
   ========================================= */
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.global-nav');
const navLinks = document.querySelectorAll('.global-nav a');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
    });
});

/* =========================================
   FAQ Accordion
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const faqCards = document.querySelectorAll('.faq-card');
    faqCards.forEach(card => {
        const q = card.querySelector('.faq-q');
        q.addEventListener('click', () => {
            const isActive = card.classList.contains('active');
            faqCards.forEach(c => c.classList.remove('active'));
            if (!isActive) {
                card.classList.add('active');
            }
        });
    });
});

/* =========================================
   Contact Form (Ajax submission via Formspree)
   ========================================= */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    const submitBtn = document.getElementById('contact-submit-btn');
    const btnLabel = submitBtn.querySelector('.btn-label');
    const errorBox = document.getElementById('contact-form-error');
    const successBox = document.getElementById('contact-form-success');
    const defaultLabelHTML = btnLabel.innerHTML;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        errorBox.hidden = true;
        submitBtn.disabled = true;
        btnLabel.textContent = '送信中...';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(contactForm)
            });

            if (response.ok) {
                contactForm.reset();
                contactForm.hidden = true;
                successBox.hidden = false;
            } else {
                errorBox.textContent = '送信に失敗しました。時間をおいて再度お試しください。';
                errorBox.hidden = false;
            }
        } catch (error) {
            errorBox.textContent = '送信に失敗しました。時間をおいて再度お試しください。';
            errorBox.hidden = false;
        } finally {
            submitBtn.disabled = false;
            btnLabel.innerHTML = defaultLabelHTML;
        }
    });
}

/* =========================================
   GSAP Scroll Animations
   ========================================= */
if (window.gsap) {
    gsap.registerPlugin(ScrollTrigger);

    if (!prefersReducedMotion) {
        // 汎用フェードイン（セクション見出し・単体ブロック）
        document.querySelectorAll('.fade-in').forEach(el => {
            gsap.fromTo(el,
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 85%', once: true }
                }
            );
        });

        // カード群のスタッガー表示
        ['.flow-list', '.pricing-list', '.faq-list'].forEach(sel => {
            const container = document.querySelector(sel);
            if (!container) return;
            gsap.fromTo(container.children,
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
                    scrollTrigger: { trigger: container, start: 'top 85%', once: true }
                }
            );
        });

        // セクションタイトルの一文字ずつリビール
        document.querySelectorAll('.section-title').forEach(title => {
            const text = title.textContent;
            title.setAttribute('aria-label', text);
            title.innerHTML = '';
            const inner = document.createElement('span');
            inner.setAttribute('aria-hidden', 'true');
            [...text].forEach(char => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? ' ' : char;
                span.style.display = 'inline-block';
                inner.appendChild(span);
            });
            title.appendChild(inner);

            gsap.fromTo(inner.children,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: 0.6, stagger: 0.03, ease: 'power2.out',
                    scrollTrigger: { trigger: title, start: 'top 88%', once: true }
                }
            );
        });

        // ヒーロー登場アニメーション
        gsap.timeline({ defaults: { ease: 'power3.out' } })
            .from('.hero-title', { opacity: 0, y: 30, duration: 1.2 })
            .from('.hero-sub', { opacity: 0, y: 20, duration: 1 }, '-=0.7')
            .from('.hero-btn', { opacity: 0, y: 20, duration: 1 }, '-=0.6');

        // ヒーローのパララックス
        const heroSection = document.querySelector('.hero');
        if (heroSection && isFinePointer) {
            heroSection.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;
                gsap.to('.hero-content', { x, y, duration: 0.6, ease: 'power2.out' });
            });
            heroSection.addEventListener('mouseleave', () => {
                gsap.to('.hero-content', { x: 0, y: 0, duration: 0.8, ease: 'power2.out' });
            });
        }

        // マグネットボタン
        if (isFinePointer) {
            document.querySelectorAll('.btn, .contact-submit-btn').forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
                });
                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
                });
            });
        }
    }
}

/* =========================================
   Custom Cursor
   ========================================= */
if (isFinePointer && !prefersReducedMotion) {
    document.body.classList.add('custom-cursor-active');

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
    });

    (function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
        requestAnimationFrame(animateRing);
    })();

    const hoverTargets = document.querySelectorAll('a, button, input, textarea, .work-card, .faq-q');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.classList.add('is-hovering');
            dot.classList.add('is-hovering');
        });
        el.addEventListener('mouseleave', () => {
            ring.classList.remove('is-hovering');
            dot.classList.remove('is-hovering');
        });
    });
}

/* =========================================
   Three.js Hero Particle Background
   ========================================= */
(function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || prefersReducedMotion) return;

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 350 : 900;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 16;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xad8f5c,
        size: 0.035,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let targetRotX = 0;
    let targetRotY = 0;
    if (isFinePointer) {
        window.addEventListener('mousemove', (e) => {
            targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.3;
            targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.2;
        });
    }

    let isVisible = true;
    const io = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
    });
    io.observe(canvas);

    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible) return;
        points.rotation.y += (targetRotY - points.rotation.y) * 0.02 + 0.0006;
        points.rotation.x += (targetRotX - points.rotation.x) * 0.02;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();
