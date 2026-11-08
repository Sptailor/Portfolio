/* Analytics.

   Three providers, one measurement path. Vercel Web Analytics counts
   pageviews; PostHog counts pageviews plus the interactions below; GA4
   mirrors the interactions if a measurement ID is set. Nothing here
   records a session, so nothing has to ask. Custom events are NOT sent to
   Vercel — they are a Pro-plan feature, so on Hobby they would be
   billed-tier-gated rather than recorded, and PostHog already holds them.

   Every interaction is read by a single delegated listener and turned
   into exactly one event, so nothing is counted twice. */
(function () {
  'use strict';

  /* -------------------------------------------------------------- config --- */

  /* An empty string leaves that provider dormant: nothing loads, nothing
     is sent, and no error is logged. Fill one in to switch it on. */
  var CONFIG = {
    /* PostHog → Settings → Project → Project API key */
    posthogToken: 'phc_mgNtUzz5kzFsi2GM3S4x3UmeABSb88P9vMJyXGHhEiLq',
    /* https://us.i.posthog.com, or https://eu.i.posthog.com for EU cloud */
    posthogHost: 'https://us.i.posthog.com',
    /* GA4 → Admin → Data streams → Measurement ID, e.g. G-XXXXXXXXXX */
    ga4Id: ''
  };

  /* A second copy of this file must not double every event. */
  if (window.__stAnalytics) { return; }
  window.__stAnalytics = { state: 'starting' };

  var OPTOUT = 'st:analytics:optout';

  /* Private browsing and blocked site data both throw on access. */
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function write(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* nothing to do */ } }
  function clear(key) { try { localStorage.removeItem(key); } catch (e) { /* nothing to do */ } }

  /* ------------------------------------------------------------- opt-out --- */

  /* Visiting ?analytics=off marks this browser as mine and keeps it out of
     every provider; ?analytics=on puts it back. The flag lives in this
     browser only, so it has to be set once per browser and per device, and
     clearing site data clears it too. */
  var query = window.location.search;
  if (/[?&]analytics=off\b/.test(query)) { write(OPTOUT, '1'); }
  if (/[?&]analytics=on\b/.test(query)) { clear(OPTOUT); }

  var host = window.location.hostname;
  var local = !host || host === 'localhost' || host === '127.0.0.1' ||
              host === '[::1]' || /\.local$/.test(host);
  var automated = navigator.webdriver === true || /Headless|bot|spider/i.test(navigator.userAgent);
  var excluded = local || automated || read(OPTOUT) === '1';

  function why() {
    if (read(OPTOUT) === '1') { return 'opted out in this browser'; }
    if (local) { return 'running locally'; }
    return 'automated browser';
  }

  if (excluded) {
    /* Set before gtag.js would load, which is how GA4 wants to be muted. */
    if (CONFIG.ga4Id) { window['ga-disable-' + CONFIG.ga4Id] = true; }
    window.__stAnalytics.state = 'off: ' + why();
    return;
  }

  window.__stAnalytics.state = 'on';

  /* ------------------------------------------------------------ providers --- */

  /* Vercel Web Analytics. Loaded here rather than from a tag in the markup
     so that an opted-out browser never fetches it at all — Vercel has no
     per-visitor opt-out of its own, so not loading it is the only lever. */
  (function vercel() {
    var s = document.createElement('script');
    s.defer = true;
    s.src = '/_vercel/insights/script.js';
    document.head.appendChild(s);
  })();

  /* PostHog. */
  if (CONFIG.posthogToken) {
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

    window.posthog.init(CONFIG.posthogToken, {
      api_host: CONFIG.posthogHost,
      defaults: '2026-08-30',

      /* The nav is hash links on one document. 'history_change' — which
         the 2026-08-30 defaults would otherwise pick — risks a second
         pageview per jump, so pin this to one pageview per page load. */
      capture_pageview: true,
      capture_pageleave: true,

      /* No analytics cookies; localStorage alone is enough to recognise a
         returning visitor, and nothing is sent up with every request. */
      persistence: 'localStorage',
      respect_dnt: true,
      person_profiles: 'identified_only',

      /* Autocapture stays on. It records $autocapture alongside the named
         events below, which is a second row for the same click but not a
         double count: no report reads both, and it is what makes the
         heatmaps work. Set to false for one event per interaction. */
      autocapture: true,

      /* No session replay. Recording a real visit is the one thing here
         that would need asking, and a permission bar is too high a price
         on a page whose job is a first impression. The masking below is
         kept deliberately: it is inert while recording is off, so that
         flipping the flag back on cannot quietly record anything raw. */
      disable_session_recording: true,
      enable_recording_console_log: false,
      session_recording: {
        maskAllInputs: true,
        maskInputOptions: { password: true, email: true },
        maskTextSelector: '.ph-mask'
      }
    });
  }

  /* GA4. */
  if (CONFIG.ga4Id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', CONFIG.ga4Id, { anonymize_ip: true });

    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.ga4Id);
    document.head.appendChild(g);
  }

  /* --------------------------------------------------------------- events --- */

  function send(name, props) {
    if (window.posthog && window.posthog.capture) { window.posthog.capture(name, props); }
    if (window.gtag) { window.gtag('event', name, props); }
  }

  /* Which band of the page the click came from, for context on where a
     recruiter actually engages. */
  function placement(el) {
    var section = el.closest ? el.closest('section[id]') : null;
    if (section) { return section.id; }
    return el.closest && el.closest('.drawer') ? 'drawer' : 'page';
  }

  /* The accordion row's heading, which is the project name. */
  function project(el) {
    var row = el.closest ? el.closest('.accrow') : null;
    var title = row ? row.querySelector('.acchead span span') : null;
    return title ? title.textContent.trim() : null;
  }

  /* One anchor yields at most one event. A GitHub link inside a project row
     is a github_click carrying the project name rather than both a
     github_click and a project_click. */
  function classify(a) {
    var href = a.getAttribute('href') || '';

    if (/\.pdf($|[?#])/i.test(href)) {
      return { name: 'resume_download', props: { placement: placement(a) } };
    }
    if (/^mailto:/i.test(href)) {
      return { name: 'contact_click', props: { method: 'email', placement: placement(a) } };
    }
    if (/^tel:/i.test(href)) {
      return { name: 'contact_click', props: { method: 'phone', placement: placement(a) } };
    }

    /* Same-document jumps and the hash nav are not outbound interest. */
    if (!a.hostname || a.hostname === window.location.hostname) { return null; }

    if (/(^|\.)linkedin\.com$/i.test(a.hostname)) {
      return { name: 'linkedin_click', props: { placement: placement(a) } };
    }
    if (/(^|\.)github\.com$/i.test(a.hostname)) {
      var path = a.pathname.replace(/^\/|\/$/g, '');
      return {
        name: 'github_click',
        props: {
          target: path || 'profile',
          project: project(a),
          placement: placement(a)
        }
      };
    }
    return {
      name: 'project_click',
      props: {
        project: project(a),
        destination: a.hostname,
        placement: placement(a)
      }
    };
  }

  /* A single listener on the document. Main.js has its own delegation on
     .rootx for the UI; this sits above it and only reads, so the two cannot
     fire each other's handlers or double up. */
  document.addEventListener('click', function (e) {
    var el = e.target;
    if (!el || !el.closest) { return; }

    var a = el.closest('a[href]');
    if (a) {
      var event = classify(a);
      if (event) { send(event.name, event.props); }
      return;
    }

    /* Opening a project row is the main engagement signal on this page.
       Main.js has already flipped aria-expanded by the time this runs, so
       only a genuine open is recorded, never the close. */
    var head = el.closest('.acchead');
    if (head && head.getAttribute('aria-expanded') === 'true') {
      send('project_expand', { project: project(head), placement: placement(head) });
    }
  });

})();
