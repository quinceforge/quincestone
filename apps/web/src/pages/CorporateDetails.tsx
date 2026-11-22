import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { applySeo } from "../seo";

const edgeLayers = [
  ["Facts", "What the person or connected system actually supplied. Facts remain separate from interpretation."],
  ["Intelligence", "A traceable interpretation of intent, context, fit and the decision that may be needed."],
  ["Policy", "The explicit authority boundary: what may proceed, what must stop and who can decide."],
  ["Next action", "A proposed, owned route. No consequential side effect occurs without the required authority."],
] as const;

export function EdgePage() {
  const [active, setActive] = useState(0);
  useEffect(() => applySeo({ title: "Quincestone Edge — Intelligence with an authority boundary", description: "Understand requests, apply approved knowledge and policy, route the next action, and preserve human judgment.", path: "/edge" }), []);
  return <div className="detail-page detail-page--edge">
    <section className="detail-hero"><p className="eyebrow">QUINCESTONE EDGE</p><h1>Intelligence with an authority boundary.</h1><p>Edge sits between customer interaction and business operations. It understands the request, uses approved knowledge, evaluates policy and proposes what happens next—without pretending every decision belongs to automation.</p><div className="actions"><Link className="button" to="/assessment">Start with an assessment</Link><Link className="text-link" to="/operate">See the operating model →</Link></div></section>
    <section className="detail-instrument"><div className="detail-instrument__intro"><p className="eyebrow">ILLUSTRATIVE INTERACTION</p><h2>A request enters. Select a layer to inspect the decision.</h2><p>This demonstration uses fictional, deterministic content. It is not connected to customer activity.</p></div><div className="edge-instrument"><div className="edge-request"><small>OBSERVED INPUT</small><strong>“I need help deciding what happens next.”</strong></div><div className="edge-layer-tabs" role="tablist" aria-label="Edge decision layers">{edgeLayers.map(([title], index) => <button type="button" role="tab" aria-selected={active === index} className={active === index ? "is-active" : ""} onClick={() => setActive(index)} key={title}><span>{String(index + 1).padStart(2,"0")}</span>{title}</button>)}</div><div className="edge-layer-result" role="tabpanel"><small>ACTIVE LAYER</small><h3>{edgeLayers[active][0]}</h3><p>{edgeLayers[active][1]}</p>{active === 2 && <div className="authority-stop"><span>AUTHORITY CHECK</span><strong>Human review required</strong><p>The system may prepare the decision. A person must authorize the exception.</p></div>}</div></div></section>
    <section className="detail-rule"><p className="eyebrow">THE EDGE RULE</p><h2>Observed facts are not derived intelligence. Intelligence is not authority. Authority is evaluated before action.</h2></section>
    <section className="detail-cta"><h2>Find the point where your operating path needs judgment.</h2><Link className="button" to="/assessment">Start the assessment</Link></section>
  </div>;
}

const commerceLoop = ["Demand", "Research", "Source", "Product", "Purchase", "Outcome", "Learning"];
const departments = [
  ["DRIVE", "Useful technology and equipment for the road."],
  ["HOME", "Considered products for everyday living."],
  ["PET", "Thoughtful essentials for companion animals."],
  ["TRAVEL", "Practical products for journeys and exploration."],
  ["WORK", "Tools and essentials for getting work done."],
] as const;

export function CommercePage() {
  const [active, setActive] = useState(0);
  useEffect(() => applySeo({
    title: "Quincestone Commerce — Discover the Quincestone Shop",
    description: "Explore Quincestone's DRIVE, HOME, PET, TRAVEL and WORK departments and enter the dedicated Quincestone Shop.",
    path: "/commerce",
  }), []);
  return <div className="detail-page detail-page--commerce">
    <section className="detail-hero">
      <p className="eyebrow">QUINCESTONE COMMERCE</p>
      <h1>A considered way to discover and shop.</h1>
      <p>Quincestone Shop brings together useful products across five focused departments. The corporate Commerce experience explains our approach; the dedicated Shop is where customers explore the full catalogue, manage their basket and complete purchases.</p>
      <div className="actions"><a className="button" href="https://shop.quincestone.com">Enter Quincestone Shop</a><Link className="text-link" to="/about">How Quincestone operates →</Link></div>
    </section>
    <section className="detail-instrument">
      <div className="detail-instrument__intro"><p className="eyebrow">ONE SHOP / FIVE DEPARTMENTS</p><h2>Focused departments. One coherent shopping experience.</h2><p>Each department serves a different customer need while sharing the same standards for product information, service and checkout.</p></div>
      <div className="belief-grid">{departments.map(([name, description], index) => <article key={name}><span>{String(index + 1).padStart(2, "0")}</span><h2>{name}</h2><p>{description}</p></article>)}</div>
    </section>
    <section className="detail-instrument">
      <div className="detail-instrument__intro"><p className="eyebrow">QUINCESTONE VERIFIED</p><h2>Confidence should be earned, not asserted.</h2><p>Verified product status is reserved for catalogue entries that satisfy Quincestone's documented evidence and publication requirements.</p></div>
      <div className="commerce-state"><span>PRODUCT PUBLICATION STANDARD</span><strong>Evidence before display</strong><p>The corporate showcase is limited to two eligible products. The current source catalogue has not yet supplied two records that pass the complete publication gate, so no product cards are being fabricated. Eligible products will appear here when verified by the authoritative Shop catalogue.</p></div>
    </section>
    <section className="detail-instrument">
      <div className="detail-instrument__intro"><p className="eyebrow">THE COMMERCE STANDARD</p><h2>From customer need to a considered purchase.</h2><p>Select a stage to understand how Quincestone approaches commerce.</p></div>
      <div className="commerce-loop" role="tablist" aria-label="Commerce process">{commerceLoop.map((stage,index)=><button type="button" role="tab" aria-selected={active===index} className={active===index?"is-active":""} onClick={()=>setActive(index)} key={stage}><span>{String(index+1).padStart(2,"0")}</span><strong>{stage}</strong></button>)}</div>
      <div className="commerce-state"><span>ACTIVE STAGE</span><strong>{commerceLoop[active]}</strong><p>{["Customer needs and useful product opportunities guide discovery.","Product claims, alternatives and unknowns are examined.","Quality, reliability, economics and operating fit are considered.","Offers are presented with clear and accurate product information.","Customers complete transactions in the dedicated Quincestone Shop.","Service and order outcomes matter beyond the moment of payment.","Evidence from customer outcomes informs future improvements."][active]}</p></div>
    </section>
    <section className="detail-cta"><h2>Explore the full Quincestone product house.</h2><p>Browse all available products, departments and shopping services in the dedicated commerce platform.</p><a className="button" href="https://shop.quincestone.com">Enter Quincestone Shop</a></section>
  </div>;
}

export function DealPage() {
  useEffect(() => applySeo({
    title: "Quincestone Deal — Commercial opportunities and negotiation",
    description: "A structured way to explore Quincestone commercial proposals, project terms and business opportunities.",
    path: "/deal",
  }), []);
  return <div className="detail-page detail-page--deal">
    <section className="detail-hero"><p className="eyebrow">QUINCESTONE DEAL</p><h1>Commercial conversations, clearly structured.</h1><p>Quincestone Deal is the intended negotiation layer for qualified project proposals, commercial opportunities, partnership discussions and agreed terms. It is designed to make scope, responsibilities, decisions and records easier to follow.</p><div className="actions"><Link className="button" to="/contact">Discuss a commercial opportunity</Link><Link className="text-link" to="/business">Explore Business services →</Link></div></section>
    <section className="belief-grid"><article><span>01</span><h2>Proposals</h2><p>Define the intended work, deliverables, assumptions and commercial scope.</p></article><article><span>02</span><h2>Negotiation</h2><p>Keep questions, revisions and agreed changes connected to the proposal.</p></article><article><span>03</span><h2>Agreements</h2><p>Record accepted terms and approval evidence before work begins.</p></article><article><span>04</span><h2>Continuity</h2><p>Connect an agreed engagement to its authorized Business workspace and delivery process.</p></article></section>
    <section className="detail-rule"><p className="eyebrow">COMMERCIAL INTEGRITY</p><h2>Clear scope. Visible decisions. Authorized commitments.</h2><p>The public Deal page is an introduction, not a representation that a payment, escrow or contract-signing service is live. Access to the dedicated Deal application will be published after its canonical domain and production readiness are verified.</p></section>
    <section className="detail-cta"><h2>Have a project or partnership in mind?</h2><Link className="button" to="/contact">Contact Quincestone</Link></section>
  </div>;
}

export function AboutPage() {
  useEffect(() => applySeo({ title: "About Quincestone — Why we exist and how we operate", description: "Quincestone builds business systems, governed intelligence and commerce experiences around real demand.", path: "/about" }), []);
  return <div className="detail-page detail-page--about">
    <section className="detail-hero"><p className="eyebrow">ABOUT QUINCESTONE</p><h1>Built for the distance between demand and outcome.</h1><p>Quincestone exists because interest alone does not create value. The systems between a person’s need and a useful outcome must understand, decide, act and learn with discipline.</p></section>
    <section className="belief-grid"><article><span>01</span><h2>Why we exist</h2><p>To make demand more useful: better understood, better qualified and connected to a practical next action.</p></article><article><span>02</span><h2>How we operate</h2><p>Discover before building. Establish authority before action. Record outcomes before claiming improvement.</p></article><article><span>03</span><h2>What we build</h2><p>Business systems, governed intelligence and commerce experiences that move real work forward.</p></article><article><span>04</span><h2>What we refuse to fake</h2><p>Customers, evidence, activity, certainty, integrations, product claims or intelligence that does not yet exist.</p></article></section>
    <section className="detail-rule"><p className="eyebrow">ONE QUINCESTONE</p><h2>Understand demand. Operate what happens next. Scale what works.</h2></section>
    <section className="detail-cta"><h2>Start with the outcome that needs to change.</h2><Link className="button" to="/assessment">Start with an assessment</Link></section>
  </div>;
}
