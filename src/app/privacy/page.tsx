import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — BridgeAI",
  description:
    "How BridgeAI collects, uses, stores, and protects your data across the web app and Chrome extension.",
};

const LAST_UPDATED = "April 23, 2026";
const CONTACT_EMAIL = "bosskero326@gmail.com";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <article className="max-w-3xl mx-auto px-6 py-20 md:py-28">
        <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground mb-8">
          Legal
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.08]">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-foreground/85">
          <section>
            <p>
              BridgeAI (&quot;we&quot;, &quot;us&quot;) provides bilingual
              subtitles and AI-generated study materials for online lectures,
              delivered through the BridgeAI web app and the BridgeAI Chrome
              extension. This policy explains what data we collect, why we
              collect it, and how you can control it. It applies to both the
              web app at bridge-ai-frontend-phi.vercel.app and the Chrome
              extension.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              1. What we collect
            </h2>
            <p className="mb-4">
              We collect only the minimum data required to operate the
              service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account details.</strong> When you register, we store
                your email address, a securely hashed password, and your
                display name.
              </li>
              <li>
                <strong>Lecture content you submit.</strong> When you ask
                BridgeAI to process a lecture — by pasting a URL in the web
                app or clicking Translate in the extension — we receive the
                lecture URL, its title, and its transcript (either provided by
                the platform or captured by the extension from the video page
                you are viewing).
              </li>
              <li>
                <strong>Generated study materials.</strong> Summaries,
                quizzes, vocabulary lists, chapter segmentation, and chat
                conversations you create from a lecture are stored in your
                account so you can return to them.
              </li>
              <li>
                <strong>Preferences.</strong> Your selected translation
                language and interface language.
              </li>
              <li>
                <strong>Basic technical logs.</strong> Our backend records
                request timestamps and error traces for debugging. These logs
                do not include your password or the contents of your
                transcripts.
              </li>
            </ul>
            <p className="mt-4">
              We do <strong>not</strong> collect browsing history, we do not
              track which sites you visit outside the four supported lecture
              platforms (Echo360, Coursera, Udemy, YouTube), and we do not use
              advertising trackers or third-party analytics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              2. How we use it
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                To translate lecture transcripts into your chosen language and
                display bilingual subtitles.
              </li>
              <li>
                To generate summaries, quizzes, vocabulary, and chapter
                navigation for lectures you save to your library.
              </li>
              <li>
                To answer your questions in the per-lecture chat using the
                lecture&apos;s transcript as context.
              </li>
              <li>
                To authenticate you across sessions and sync your library
                between the web app and the extension.
              </li>
              <li>
                To diagnose errors and improve reliability of the service.
              </li>
            </ul>
            <p className="mt-4">
              We do not sell your data. We do not use your data to train
              third-party AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              3. Who we share it with
            </h2>
            <p className="mb-4">
              To deliver the service, we send specific data to the following
              subprocessors:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>OpenAI</strong> and <strong>Anthropic</strong> — we
                send lecture transcripts and your chat messages to generate
                translations, summaries, quizzes, vocabulary, and chat
                responses. These providers process the data under their
                respective API terms and do not use API inputs to train their
                models.
              </li>
              <li>
                <strong>Amazon Web Services</strong> (DynamoDB, Fargate,
                App Runner) — hosts our backend and stores your account data
                and generated study materials.
              </li>
              <li>
                <strong>Vercel</strong> — hosts the BridgeAI web app
                frontend.
              </li>
              <li>
                <strong>Render</strong> — hosts the YouTube transcript
                fetching service.
              </li>
            </ul>
            <p className="mt-4">
              We do not share your data with advertisers or data brokers. We
              will disclose data only if legally required (for example, a
              valid court order).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              4. The Chrome extension specifically
            </h2>
            <p className="mb-4">
              The BridgeAI Chrome extension runs only on the four supported
              lecture platforms listed in its manifest (echo360.net.au,
              echo360.org.au, coursera.org, udemy.com, youtube.com) and on the
              BridgeAI web app. On those pages, it:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Reads the transcript or captions of the video you are
                currently watching, when you click Translate.
              </li>
              <li>
                Sends that transcript and its URL to the BridgeAI backend for
                translation.
              </li>
              <li>
                Overlays the returned bilingual subtitles onto the video
                player.
              </li>
              <li>
                Reads your BridgeAI session token from the web app so the
                extension can save lectures to your account.
              </li>
            </ul>
            <p className="mt-4">
              The extension does not read page content on any other website.
              It does not record audio, video, keystrokes, or form inputs. It
              does not inject ads.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              5. Data retention
            </h2>
            <p>
              Your account data and saved lectures remain in your library
              until you delete them or delete your account. You can delete an
              individual lecture from inside the web app. To delete your
              entire account and all associated data, email us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              from the address registered to the account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              6. Security
            </h2>
            <p>
              Passwords are stored hashed, never in plain text. All traffic
              between the extension, the web app, and the backend is encrypted
              in transit via HTTPS. No system is perfectly secure, but we
              follow standard practices and only store what the service
              requires.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              7. Children
            </h2>
            <p>
              BridgeAI is intended for university students and adult learners.
              It is not directed at children under 13, and we do not knowingly
              collect data from them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              8. Changes to this policy
            </h2>
            <p>
              We may update this policy as the product evolves. The Last
              updated date at the top of this page will reflect any change.
              Material changes will be communicated in-app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-3">
              9. Contact
            </h2>
            <p>
              Questions, deletion requests, or any other privacy concerns:
              email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-4"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-border/60">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            ← Back to BridgeAI
          </Link>
        </div>
      </article>
    </div>
  );
}
