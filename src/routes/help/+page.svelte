<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';

  const sections = [
    { id: 'intro', title: 'Introduction' },
    { id: 'step_1', title: '1. Where to find ideas?' },
    { id: 'step_2', title: '2. How to filter ideas?' },
    { id: 'step_3', title: '3. How to sort ideas?' },
    { id: 'step_4', title: '4. How to plan an idea?' },
    { id: 'step_5', title: '5. How to create an idea using AI?' },
    { id: 'step_6', title: '6. How to customize an idea using AI?' },
    { id: 'step_7', title: '7. How to print an idea?' },
    { id: 'step_8', title: '8. How to favourite an idea?' },
    { id: 'step_9', title: '9. How to give an idea a rating?' },
    { id: 'step_10', title: '10. How to leave a comment on an idea?' },
    { id: 'step_11', title: '11. How to change the website color scheme?' },
    { id: 'step_12', title: '12. How to log in' },
    { id: 'step_13', title: '13. How to sign up' },
    { id: 'faqs', title: 'FAQs' },
  ];

  let activeSection = 'intro';
  let isProgrammaticScroll = false;

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (!isProgrammaticScroll && visible.length > 0) {
          activeSection = visible[0].target.id;
        }
      },
      {
        rootMargin: '-30% 0px -60% 0px',
      },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  });

  function scrollTo(id) {
    isProgrammaticScroll = true;
    activeSection = id;

    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
    });

    // Re-enable observer after scroll finishes
    setTimeout(() => {
      isProgrammaticScroll = false;
    }, 500);
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
    <h2 class="text-sm font-semibold mb-3" style="color: var(--color-text-secondary);">
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
  <div class="max-w-7xl mx-auto px-6 py-10 flex gap-10" style="padding-left: 18rem;">
    <main class="flex-1 space-y-14 leading-relaxed">
      <section id="intro">
        <h1 class="text-3xl font-bold mb-4" style="color: var(--color-primary-dark);">
          Help & Guides
        </h1>
        <p>
          This guide explains how to use Green Clues to discover, plan, personalize, and share
          sustainability activities.
        </p>
      </section>

      <!-- Steps -->
      <section id="step_1">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          1. Where to find ideas?
        </h2>
        <p>
          You can click <strong>Home</strong> in the navigation bar to see all available ideas. If you're
          having trouble finding it, click the button below:
        </p>

        <button
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg
      bg-white border border-[var(--color-border-light)]
      text-[var(--color-primary-dark)]
      hover:bg-gray-50 transition mt-3"
          on:click={() => goto(resolve('/'))}
        >
          🏠 Go To Home
        </button>
      </section>

      <section id="step_2">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          2. How to filter ideas?
        </h2>

        <p>
          First, click the <strong>Filter</strong> button on the Ideas page. It's the button on the far
          right of the search bar.
        </p>

        <img
          src="/help-images/2.1.png"
          alt="Ideas page with Filter button"
          class="my-4 rounded shadow"
        />

        <p>
          A side menu will appear on the right where you can select the filters you want, such as <strong
            >Difficulty</strong
          >, <strong>Season</strong>, <strong>Subject</strong>, <strong>Weather</strong>,
          <strong>Age Range</strong>, and <strong>Duration</strong>.
        </p>

        <img src="/help-images/2.2.png" alt="Filters side menu" class="my-4 rounded shadow" />

        <p>
          Finally, <strong>very important</strong>: click the <strong>Apply</strong> button at the bottom
          to apply your filters and see the ideas that match your criteria.
        </p>
      </section>

      <section id="step_3">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          3. How to sort ideas?
        </h2>

        <p>
          First, click the <strong>sort</strong> button on the Ideas page. This button opens a dropdown
          with the options you can sort from.
        </p>

        <img
          src="/help-images/3.png"
          alt="Ideas page with sort button"
          class="my-4 rounded shadow"
        />

        <p>The arrows up mean ascending and arrows down mean descending.</p>
      </section>

      <section id="step_4">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          4. How to plan an Idea?
        </h2>

        <p>
          First, click the <strong>idea</strong> from the Ideas page that you want to plan. Then on
          the page of your chosen idea you click <strong>plan</strong>.
        </p>

        <img src="/help-images/4.1.png" alt="Ideas detail page" class="my-4 rounded shadow" />

        <p>
          When you click that this screen will appear, if you click <strong>save</strong> with out selecting
          a time and date you will see this pop up in the right corner.
        </p>

        <img
          src="/help-images/4.3.png"
          alt="planner no time selected with error message"
          class="my-4 rounded shadow"
        />

        <p>
          When you click a time slot it will also apear on the left to show the time and date
          selected and then you online have to click <strong>save</strong>, it will automaticly
          select the max time of the idea
        </p>

        <img src="/help-images/4.4.png" alt="planner time selected" class="my-4 rounded shadow" />

        <p>The plan will be shown on the dashboard if created</p>

        <img src="/help-images/4.5.png" alt="planner time selected" class="my-4 rounded shadow" />

        <button
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg
        bg-[var(--color-primary)]
        text-white font-semibold
        hover:bg-[var(--color-primary-dark)] transition"
          on:click={() => goto(resolve('/dashboard'))}
        >
          📊 Go to Dashboard
        </button>
      </section>

      <section id="step_5">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          5. How to create an idea using AI
        </h2>
        <p>Click on the home page on gernerate with AI</p>
        <img
          src="/help-images/3.png"
          alt="Ideas page with sort button"
          class="my-4 rounded shadow"
        />
        <p>
          Chat with the bot to gernerate the idea and click on save the idea in the bottom of the
          response
        </p>
        <img
          src="/help-images/5.png"
          alt="Ideas page with sort button"
          class="my-4 rounded shadow"
        />
      </section>

      <section id="step_6">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          6. How to customize/personalize an idea using AI
        </h2>
        <p>Press the Button personalize next to plan on the Idea details page</p>
        <img src="/help-images/4.1.png" alt="Ideas detail page" class="my-4 rounded shadow" />
        <p>Then this image will appear, asking what you need to have changed</p>
        <img src="/help-images/6.1.png" alt="personalization page" class="my-4 rounded shadow" />
        <p>You can chat with this ai to alter the idea, dont forget to click on apply changes</p>
        <img
          src="/help-images/6.2.png"
          alt="personalization page with text"
          class="my-4 rounded shadow"
        />
      </section>

      <section id="step_7">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          7. How to print an idea?
        </h2>
        <p>
          On the ideas details page (so when you have selected an idea) you click the button print
        </p>
        <img src="/help-images/4.1.png" alt="Ideas details page" class="my-4 rounded shadow" />
      </section>

      <section id="step_8">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          8. How to favourite an idea?
        </h2>
        <p>
          On the ideas details page on the ideas image there is a heart and if the heart is clicked
          it turns red and means its favourited.
        </p>
        <img src="/help-images/4.1.png" alt="Ideas details page" class="my-4 rounded shadow" />
        <p>The Favourited ideas can be found on the dashboard by clicking the button saved ideas</p>
        <img src="/help-images/8.1.png" alt="saved Ideas  page" class="my-4 rounded shadow" />
        <img src="/help-images/8.2.png" alt="saved Ideas  page" class="my-4 rounded shadow" />
        <button
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg
        bg-[var(--color-primary)]
        text-white font-semibold
        hover:bg-[var(--color-primary-dark)] transition"
          on:click={() => goto(resolve('/dashboard'))}
        >
          📊 Go to Dashboard
        </button>
      </section>

      <section id="step_9">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          9. How to give idea an rating?
        </h2>
        <p>
          On the ideas details page when you scroll all the way down you can leave a comment with a
          rating with it.
        </p>
        <img
          src="/help-images/9.1.png"
          alt="Ideas details page scrolled down"
          class="my-4 rounded shadow"
        />
        <p>
          You can just click the amount of stars for the rating and leave an text comment with your
          reasoning
        </p>
        <img
          src="/help-images/9.2.png"
          alt="Ideas details page scrolled down"
          class="my-4 rounded shadow"
        />
      </section>

      <section id="step_10">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          10. How to give idea a comment?
        </h2>
        <p>
          On the ideas details page when you scroll all the way down you can leave a comment with a
          rating with it.
        </p>
        <img
          src="/help-images/9.1.png"
          alt="Ideas details page scrolled down"
          class="my-4 rounded shadow"
        />
        <p>
          You can just click the amount of stars for the rating and leave an text comment with your
          reasoning
        </p>
        <img src="/help-images/9.2.png" alt="Example making comment" class="my-4 rounded shadow" />
        <img src="/help-images/9.3.png" alt="Comment made" class="my-4 rounded shadow" />
        <p>When clicked Submit review people can like and dislike your comment.</p>
      </section>

      <section id="step_11">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          11. How to change color scheme?
        </h2>
        <p>
          When you click right top of you screen on your user a dropdown will apear and then you
          need to click <strong>Profile</strong>.
        </p>
        <img src="/help-images/11.1.png" alt="Location profile page" class="my-4 rounded shadow" />
        <p>
          On the profile page you can just click different theme that you might like in the theme
          selection.
        </p>
        <img src="/help-images/11.2.png" alt="Example profile page" class="my-4 rounded shadow" />
        <img src="/help-images/11.3.png" alt="new theme selected" class="my-4 rounded shadow" />
      </section>

      <section id="step_12">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          12. How do i log in
        </h2>
        <p>On the right side of the navigation bar on the top right it says log in.</p>
        <img src="/help-images/12-13.png" alt="Location login page" class="my-4 rounded shadow" />
        <p>
          On the log in page you just fill in your information and you get logged in, if you dont
          have a account you should click sign up at the bottom
        </p>
        <img src="/help-images/12.1.png" alt="login page" class="my-4 rounded shadow" />
      </section>
      <section id="step_13">
        <h2 class="text-xl font-semibold mb-2" style="color: var(--color-primary-dark);">
          13. How do i log in
        </h2>
        <p>On the right side of the navigation bar on the top right it says Sign up.</p>
        <img src="/help-images/12-13.png" alt="Location login page" class="my-4 rounded shadow" />
        <p>
          On the sign up page you just fill in your information and create and account once created
          you get redirected to login page, if you already have an acount you should click log in at
          the bottom
        </p>
        <img src="/help-images/13.1.png" alt="login page" class="my-4 rounded shadow" />
      </section>

      <!-- FAQs -->
      <section id="faqs">
        <h2 class="text-xl font-semibold mb-4" style="color: var(--color-primary-dark);">FAQs</h2>

        <div class="space-y-3">
          {#each [{ q: 'Can parents use Green Clues?', a: 'Yes, Green Clues works for both teachers and parents.' }, { q: 'Can I personalize activities?', a: 'Yes, AI tools allow you to adapt activities easily.' }, { q: 'Where can i find my favourited ideas', a: 'You can find these at the dashboard' }] as faq, i}
            <div class="border rounded-lg" style="border-color: var(--color-border);">
              <button
                class="w-full flex justify-between items-center px-4 py-3 font-medium"
                on:click={() => (openFaq = openFaq === i ? null : i)}
              >
                {faq.q}
                <span>{openFaq === i ? '−' : '+'}</span>
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
