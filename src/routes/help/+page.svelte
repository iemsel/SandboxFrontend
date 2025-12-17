<script>
  import { onMount } from "svelte";

  const sections = [
    { id: "intro", title: "Introduction" },
    { id: "step_1", title: "1. Where to find ideas?" },
    { id: "step_2", title: "2. How to filter ideas?" },
    { id: "step_3", title: "3. How to sort ideas?" },
    { id: "step_4", title: "4. How to plan an idea?" },
    { id: "step_5", title: "5. How to invite groups to planning an idea?" },
    { id: "step_6", title: "6. How to create an idea?" },
    { id: "step_7", title: "7. How to create an idea using AI?" },
    { id: "step_8", title: "8. How to customize an idea using AI?" },
    { id: "step_9", title: "9. How to monitor an idea?" },
    { id: "step_10", title: "10. How to print an idea?" },
    { id: "step_11", title: "11. How to give an idea a rating?" },
    { id: "step_12", title: "12. How to leave a comment on an idea?" },
    { id: "step_13", title: "13. How to change the website color scheme?" },
    { id: "step_14", title: "14. How to join a group?" },
    { id: "step_15", title: "15. How to chat in a specific group?" },
    { id: "step_16", title: "16. How to share an idea?" },
    { id: "faqs", title: "FAQs" },
  ];

  let activeSection = "intro";

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeSection = entry.target.id;
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  });

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  }

  let openFaq = null;
</script>

<div class="max-w-7xl mx-auto px-6 py-10 flex gap-10">
  <!-- TOC -->
  <aside
    class="w-64 shrink-0"
    style="
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
  "
  >
    <h2
      class="text-sm font-semibold mb-3"
      style="color: var(--color-text-secondary);"
    >
      On this page
    </h2>

    <nav class="flex flex-col gap-1 text-sm">
      {#each sections as section}
        <button
          on:click={() => scrollTo(section.id)}
          class="text-left px-2 py-1 rounded"
          style="
            color: {activeSection === section.id
            ? 'var(--color-primary-dark)'
            : 'var(--color-text-primary)'};
            background: {activeSection === section.id
            ? 'var(--color-primary-light)'
            : 'transparent'};
          "
        >
          {section.title}
        </button>
      {/each}
    </nav>
  </aside>

  <!-- Content -->
  <div
    class="max-w-7xl mx-auto px-6 py-10 flex gap-10"
    style="padding-left: 18rem;"
  >
    <main class="flex-1 space-y-14 leading-relaxed">
      <section id="intro">
        <h1
          class="text-3xl font-bold mb-4"
          style="color: var(--color-primary-dark);"
        >
          Help & Guides
        </h1>
        <p>
          This guide explains how to use Green Clues to discover, plan,
          personalize, and share sustainability activities.
        </p>
      </section>

      <!-- Steps -->
      {#each sections.slice(1, -1) as section}
        <section id={section.id}>
          <h2
            class="text-xl font-semibold mb-2"
            style="color: var(--color-primary-dark);"
          >
            {section.title}
          </h2>
          <p>Add a short explanation or screenshot for this step.</p>
        </section>
      {/each}

      <!-- FAQs -->
      <section id="faqs">
        <h2
          class="text-xl font-semibold mb-4"
          style="color: var(--color-primary-dark);"
        >
          FAQs
        </h2>

        <div class="space-y-3">
          {#each [{ q: "Can parents use Green Clues?", a: "Yes, Green Clues works for both teachers and parents." }, { q: "Can I personalize activities?", a: "Yes, AI tools allow you to adapt activities easily." }] as faq, i}
            <div
              class="border rounded-lg"
              style="border-color: var(--color-border);"
            >
              <button
                class="w-full flex justify-between items-center px-4 py-3 font-medium"
                on:click={() => (openFaq = openFaq === i ? null : i)}
              >
                {faq.q}
                <span>{openFaq === i ? "−" : "+"}</span>
              </button>

              {#if openFaq === i}
                <div class="px-4 pb-4 text-sm">
                  {faq.a}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    </main>
  </div>
</div>
