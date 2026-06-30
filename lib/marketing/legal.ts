import { APP_NAME } from "@/lib/branding";
import { contactEmail } from "@/lib/marketing/faqs";

export const legalLastUpdated = "June 20, 2025";

export const privacyEmail = contactEmail;
export const legalEmail = contactEmail;

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
};

export type LegalDocument = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  intro: `These Terms of Service ("Terms") govern your access to and use of ${APP_NAME} — including our website, photographer workspace, client galleries, booking tools, and related services (collectively, the "Services"). By creating an account, accessing a gallery, or otherwise using the Services, you agree to these Terms and to our Privacy Policy, which is incorporated by reference. If you do not agree, do not use the Services.`,
  sections: [
    {
      id: "definitions",
      title: "1. Definitions",
      paragraphs: [
        `"${APP_NAME}," "we," "us," and "our" refer to the operator of the ${APP_NAME} platform.`,
        `"User," "you," and "your" refer to a photographer, studio, or other account holder who registers for and uses the Services.`,
        `"Client" refers to an end user who views, selects from, or otherwise interacts with a gallery or other property hosted by a User through the Services.`,
        `"Content" means photographs, videos, text, branding assets, metadata, and other materials uploaded to or transmitted through the Services.`,
      ],
    },
    {
      id: "services",
      title: "2. Description of Services",
      paragraphs: [
        `${APP_NAME} is a software-as-a-service platform for professional photographers and studios. The Services may include, depending on your plan: client gallery hosting and delivery; online proofing and selection workflows; branded share links and custom studio URLs; booking and scheduling; contracts and invoicing; notifications; analytics; and other studio management tools.`,
        `We may add, change, or discontinue features at any time. Where a change materially reduces paid functionality you rely on, we will use reasonable efforts to notify you in advance.`,
      ],
    },
    {
      id: "registration",
      title: "3. Account Registration and Security",
      paragraphs: [
        `To use certain features, you must register for an account and provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.`,
        `You must promptly notify us at ${legalEmail} if you suspect unauthorized access. We may suspend or terminate accounts that appear compromised or that violate these Terms.`,
        `You must be at least 18 years old — or the age of majority in your jurisdiction — to create an account. By registering, you represent that you meet this requirement.`,
      ],
    },
    {
      id: "acceptable-use",
      title: "4. Acceptable Use",
      paragraphs: [
        `You agree to use the Services only in compliance with applicable laws and these Terms. You are solely responsible for Content you upload and for communications you send through the Services.`,
        `You may not upload, share, or facilitate distribution of Content that:`,
      ],
      list: [
        "is unlawful, fraudulent, harassing, defamatory, obscene, or invasive of another person's privacy;",
        "infringes any copyright, trademark, publicity, privacy, or other proprietary right;",
        "contains malware or is designed to disrupt systems or gain unauthorized access;",
        "constitutes spam, unauthorized advertising, or deceptive impersonation; or",
        "depicts individuals in violation of applicable consent, child-protection, or portrait-rights laws.",
      ],
    },
    {
      id: "content-license",
      title: "5. Your Content and License to Us",
      paragraphs: [
        `You retain ownership of Content you upload. You grant ${APP_NAME} a worldwide, non-exclusive, royalty-free license to host, store, reproduce, transmit, display, and otherwise use your Content solely to operate, provide, secure, and improve the Services — including delivering galleries to your Clients, generating previews, and creating backups.`,
        `You represent and warrant that you have all rights necessary to upload Content and to grant this license, including model releases, property releases, and client permissions where required.`,
        `You are responsible for maintaining your own backups. While we employ safeguards, we are not liable for loss of Content except where required by applicable law.`,
      ],
    },
    {
      id: "client-galleries",
      title: "6. Client Galleries and End Users",
      paragraphs: [
        `When you share a gallery link, invite a Client, or collect information through the Services, you act as the data controller for that Client relationship. ${APP_NAME} processes Client data on your instructions to provide the Services.`,
        `You are responsible for providing your Clients with any notices, consents, image licenses, or privacy disclosures required by your business and applicable law. ${APP_NAME} is not a party to agreements between you and your Clients unless explicitly stated.`,
        `Clients who believe their personal data has been mishandled should contact you first. We will assist Users with lawful data requests as described in our Privacy Policy.`,
      ],
    },
    {
      id: "fair-use",
      title: "7. Plans, Storage, and Fair Use",
      paragraphs: [
        `Features, storage limits, bandwidth, and the number of active galleries may vary by subscription plan. Usage beyond your plan limits may require an upgrade or incur additional fees.`,
        `Plans are intended for professional photography businesses. Reselling access to the platform, operating abusive automated scraping, or using the Services primarily as generic file storage unrelated to client delivery may violate fair use and result in suspension.`,
        `We may apply rate limits or technical restrictions to protect platform stability and other users.`,
      ],
    },
    {
      id: "billing",
      title: "8. Fees, Billing, and Refunds",
      paragraphs: [
        `Paid plans are billed in advance on a recurring basis unless otherwise stated at checkout. Prices are shown exclusive of applicable taxes unless noted. You authorize us and our payment processors to charge your selected payment method for recurring fees and applicable taxes.`,
        `Subscriptions renew automatically for the same term unless canceled before the renewal date through your account settings or by contacting us. Downgrades and cancellations take effect at the end of the current billing period unless stated otherwise.`,
        `Except where required by law or expressly stated in writing, fees are non-refundable. If payment fails, we may suspend paid features until the balance is resolved.`,
        `Upon cancellation or termination, your account and Content may be deleted after any applicable retention period described in our Privacy Policy.`,
      ],
    },
    {
      id: "third-party",
      title: "9. Third-Party Services",
      paragraphs: [
        `The Services may integrate with or link to third-party tools — including payment processors for subscription billing, email providers, and calendar services. Those services are operated by independent providers and are subject to their own terms and privacy practices.`,
        `${APP_NAME} does not control and is not responsible for third-party services. Your use of them is at your own risk.`,
      ],
    },
    {
      id: "ip",
      title: `10. ${APP_NAME} Intellectual Property`,
      paragraphs: [
        `The Services, including software, design, logos, and documentation, are owned by ${APP_NAME} or its licensors and are protected by intellectual property laws. These Terms do not grant you any right to use our trademarks except as needed to describe your lawful use of the Services.`,
        `You may not copy, modify, reverse engineer, or create derivative works of the Services except where such restrictions are prohibited by law.`,
      ],
    },
    {
      id: "dmca",
      title: "11. Copyright Complaints",
      paragraphs: [
        `We respect intellectual property rights. If you believe Content on the Services infringes your copyright, send a notice to ${legalEmail} including:`,
      ],
      list: [
        "identification of the copyrighted work;",
        "identification of the allegedly infringing material and its location;",
        "your contact information;",
        "a statement of good-faith belief that use is unauthorized;",
        "a statement, under penalty of perjury, that the information is accurate and you are authorized to act; and",
        "your physical or electronic signature.",
      ],
    },
    {
      id: "privacy-ref",
      title: "12. Privacy",
      paragraphs: [
        `Our Privacy Policy explains how we collect, use, and share personal information. By using the Services, you also agree to the Privacy Policy.`,
      ],
    },
    {
      id: "disclaimers",
      title: "13. Disclaimers",
      paragraphs: [
        `THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE." TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${APP_NAME.toUpperCase()} DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.`,
        `We do not guarantee uninterrupted or error-free operation, that galleries will be free from unauthorized copying, or that third-party integrations will meet every availability or processing expectation.`,
      ],
    },
    {
      id: "liability",
      title: "14. Limitation of Liability",
      paragraphs: [
        `TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${APP_NAME.toUpperCase()} AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS OPPORTUNITY, ARISING FROM OR RELATED TO THE SERVICES.`,
        `OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICES WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID TO ${APP_NAME.toUpperCase()} IN THE TWELVE MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS (US$100).`,
        `Some jurisdictions do not allow certain limitations, so some of the above may not apply to you.`,
      ],
    },
    {
      id: "indemnity",
      title: "15. Indemnification",
      paragraphs: [
        `You agree to defend, indemnify, and hold harmless ${APP_NAME} and its affiliates from claims, damages, losses, and expenses — including reasonable legal fees — arising from your Content, your client relationships, your violation of these Terms, or your violation of any law or third-party right.`,
      ],
    },
    {
      id: "termination",
      title: "16. Suspension and Termination",
      paragraphs: [
        `You may stop using the Services at any time and may cancel paid subscriptions through your account settings.`,
        `We may suspend or terminate access immediately if you materially breach these Terms, create legal or security risk, fail to pay fees, or use the Services unlawfully. Where reasonable, we will provide notice before termination.`,
        `Sections that by their nature should survive termination — including content licenses granted to operate the Services during your account lifetime, disclaimers, limitations of liability, and indemnification — will survive.`,
      ],
    },
    {
      id: "changes",
      title: "17. Changes to These Terms",
      paragraphs: [
        `We may update these Terms from time to time. If changes are material, we will provide notice by email, in-product message, or by posting an updated version on our website. Continued use after the effective date constitutes acceptance of the revised Terms.`,
      ],
    },
    {
      id: "law",
      title: "18. Governing Law and Disputes",
      paragraphs: [
        `These Terms are governed by the laws of the jurisdiction in which ${APP_NAME} is established, without regard to conflict-of-law principles, except where mandatory consumer protections in your country require otherwise.`,
        `Before filing a formal claim, you agree to contact us at ${legalEmail} and attempt to resolve the dispute informally within thirty (30) days.`,
      ],
    },
    {
      id: "contact",
      title: "19. Contact",
      paragraphs: [
        `Questions about these Terms may be sent to ${legalEmail}.`,
      ],
    },
  ],
};

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  intro: `Thank you for using ${APP_NAME}. This Privacy Policy describes how we collect, use, share, and protect personal information when you visit our website, create an account, deliver client galleries, or otherwise interact with our Services. We may update this policy as we release new features or when legal requirements change. We encourage you to review it periodically.`,
  sections: [
    {
      id: "definitions",
      title: "1. Who We Are and Key Terms",
      paragraphs: [
        `"${APP_NAME}," "we," "us," and "our" refer to the operator of the ${APP_NAME} platform.`,
        `"Users" are photographers, studios, and account holders who subscribe to or trial the Services.`,
        `"Clients" are individuals who view galleries, make selections, book sessions, or otherwise interact with a User's ${APP_NAME} properties.`,
        `"Personal information" means information that identifies or can reasonably be linked to an individual.`,
      ],
    },
    {
      id: "collect",
      title: "2. Information We Collect",
      paragraphs: [
        `We collect information in three broad categories:`,
      ],
      list: [
        "Account and profile information — such as your name, email address, studio name, password hash, billing details, plan selection, branding settings, and support communications.",
        "Gallery and business data — photographs, gallery titles, client names and email addresses you upload, booking details, contracts, invoices, selection activity, and comments.",
        "Technical and usage information — IP address, browser and device type, pages viewed, feature usage, referral URLs, crash logs, and cookies or similar technologies.",
      ],
    },
    {
      id: "how-collect",
      title: "3. How We Collect Information",
      paragraphs: [
        `We collect information when you register, upload Content, configure galleries, communicate with support, subscribe to paid plans, or use integrated third-party services you connect.`,
        `We automatically collect technical data when you or your Clients use the Services, including through cookies and analytics tools.`,
        `We may receive information from payment processors, email providers, and authentication services to complete subscription billing and deliver features you request.`,
      ],
    },
    {
      id: "use",
      title: "4. How We Use Information",
      paragraphs: [
        `We use personal information to:`,
      ],
      list: [
        "provide, maintain, and secure the Services, including hosting galleries and managing proofing workflows;",
        "authenticate accounts, prevent fraud, and enforce our Terms of Service;",
        "communicate with you about your account, billing, product updates, and support requests;",
        "analyze usage to improve performance, features, and user experience;",
        "comply with legal obligations and respond to lawful requests; and",
        "send marketing communications where permitted — you may opt out at any time.",
      ],
    },
    {
      id: "share",
      title: "5. How We Share Information",
      paragraphs: [
        `We do not sell your personal information. We share information only as described below:`,
      ],
      list: [
        "Service providers — hosting, content delivery, email delivery, customer support tools, analytics, and payment processors that help us operate the Services under contractual confidentiality and security obligations.",
        "At your direction — when you share a gallery, send a booking link, or integrate a third-party tool, relevant information is shared to fulfill that request.",
        "Business transfers — in connection with a merger, acquisition, financing, or sale of assets, subject to standard confidentiality protections.",
        "Legal and safety — when required by law, court order, or to protect the rights, property, or safety of ${APP_NAME}, our Users, Clients, or the public.",
      ],
    },
    {
      id: "roles",
      title: "6. Users and Clients — Controller and Processor Roles",
      paragraphs: [
        `When you use ${APP_NAME} to manage client relationships, you are generally the data controller for Client personal information, and ${APP_NAME} acts as a data processor processing that information on your instructions to provide the Services.`,
        `If you are subject to the EU/UK General Data Protection Regulation (GDPR) and require a data processing agreement, contact us at ${privacyEmail}.`,
        `Clients who wish to exercise privacy rights regarding data collected through a photographer's gallery should contact that photographer directly. We will assist Users in responding to lawful requests where appropriate.`,
      ],
    },
    {
      id: "security",
      title: "7. Data Security",
      paragraphs: [
        `We implement administrative, technical, and organizational measures designed to protect personal information, including encryption in transit, access controls, and monitoring. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.`,
        `You are responsible for safeguarding your account credentials and for configuring gallery access controls appropriate to your clients' expectations.`,
      ],
    },
    {
      id: "retention",
      title: "8. Data Retention",
      paragraphs: [
        `We retain personal information for as long as your account is active or as needed to provide the Services, comply with legal obligations, resolve disputes, and enforce agreements.`,
        `After account closure, we may retain certain information for a limited period to support backups, billing records, fraud prevention, and legal compliance, then delete or anonymize it.`,
        `You may request deletion of your account by contacting ${privacyEmail}. Deletion may be subject to legal retention requirements and technical backup cycles.`,
      ],
    },
    {
      id: "transfers",
      title: "9. International Transfers",
      paragraphs: [
        `We may process and store information in countries other than where you or your Clients are located. Where required, we use appropriate safeguards — such as standard contractual clauses or equivalent mechanisms — for cross-border transfers of personal information.`,
      ],
    },
    {
      id: "rights",
      title: "10. Your Privacy Rights",
      paragraphs: [
        `Depending on your location, you may have rights to access, correct, delete, restrict, or port personal information, or to object to certain processing. You can update much easier-to-change details in your account settings.`,
        `To exercise rights, contact ${privacyEmail}. We may verify your identity before fulfilling a request. If you are a Client of a User, we may direct you to contact that User first.`,
        `Residents of the European Economic Area, United Kingdom, California, and other regions with privacy laws may have additional rights described by applicable regulations.`,
      ],
    },
    {
      id: "cookies",
      title: "11. Cookies and Similar Technologies",
      paragraphs: [
        `We use cookies and similar technologies to keep you signed in, remember preferences, measure traffic, and improve the Services. You can control cookies through your browser settings, though some features may not function properly if cookies are disabled.`,
      ],
    },
    {
      id: "children",
      title: "12. Children's Privacy",
      paragraphs: [
        `The Services are not directed to children under 16, and we do not knowingly collect personal information from children under 16. Photographers who photograph minors are responsible for obtaining appropriate parental or guardian consent under applicable law.`,
        `If you believe we have collected information from a child without proper authorization, contact ${privacyEmail}.`,
      ],
    },
    {
      id: "changes",
      title: "13. Changes to This Policy",
      paragraphs: [
        `We may revise this Privacy Policy from time to time. Material changes will be communicated by email, in-product notice, or by updating the "Last updated" date on this page. Your continued use after the effective date constitutes acceptance of the revised policy.`,
      ],
    },
    {
      id: "contact",
      title: "14. Contact Us",
      paragraphs: [
        `Privacy questions and requests may be sent to ${privacyEmail}.`,
      ],
    },
  ],
};
