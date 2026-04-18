# PARADOSIS — INHERITANCE LEGAL GUIDE
## All 10 Asset Types: Processes, State Variations, Relationship Rules & Dashboard Implementation

---

## BEFORE EVERYTHING ELSE — THE TWO CERTIFICATES YOU ALWAYS NEED

Before diving into each asset type, understand that almost everything in Indian inheritance
requires one or both of these certificates. These are the foundation.

### Death Certificate
Issued by the local municipal authority or panchayat.
Available digitally via DigiLocker / CRS portal.
Required for: everything. This is always Step 1.
Time to get: 7–15 days if registered within 21 days of death.

### Legal Heir Certificate
Issued by: Tehsildar or SDM (Sub-Divisional Magistrate) office.
What it does: Establishes WHO the legal heirs are. Proves relationship to deceased.
Required for: property mutation, pension, EPF/PPF, some bank claims.
Time to get: 15–30 days.
Cost: ₹50–500 depending on state.
State variation: Different names across states —
  Maharashtra: "Heirship Certificate" (from court, not tehsildar)
  Delhi: "Surviving Member Certificate" (Revenue Department)
  Andhra Pradesh / Telangana: "Legal Heir Certificate" (Tahsildar)
  Tamil Nadu: "Legal Heir Certificate" (Tahsildar)
  Karnataka: "Legal Heir Certificate" (Tahsildar)
  Kerala: "Legal Heirship Certificate" (Village Officer/Tahsildar)
  West Bengal: From court (more complex process)

### Succession Certificate
Issued by: District Civil Court (not an office — an actual court).
What it does: Gives legal authority to COLLECT and MANAGE movable financial assets.
Required for: bank accounts (no nominee), FDs (no nominee), mutual funds, stocks, securities.
Time to get: 3–6 months (court process).
Cost: Court fee = percentage of asset value (typically 2–3% capped at state limits).
Governing law: Indian Succession Act, 1925.
Key fact: One succession certificate can cover multiple assets if all listed in the petition.
Does NOT require separate certificates per bank or per city — valid nationwide.

---

## RELATIONSHIP RULES — HOW THEY AFFECT EVERY ASSET

### Hindu Succession Act (applies to Hindus, Buddhists, Jains, Sikhs)

Class I Heirs (inherit first, equal shares):
Spouse, sons, daughters, mother, son's widow, son's son, son's daughter,
daughter's son, daughter's daughter, widow of predeceased son.

Class II Heirs (only if no Class I heir exists):
Father, brother, sister, daughter's son's son, daughter's son's daughter,
brother's son, sister's son, brother's daughter, sister's daughter, and others.

What this means for the dashboard:
- Wife/Husband: Class I — strongest legal position, no court challenge typically possible
- Son/Daughter: Class I — equal rights (daughters have same rights as sons since 2005 amendment)
- Mother: Class I — but shares with spouse and children
- Father: Class II — only inherits if spouse, children, and mother are all absent
- Brother/Sister: Class II — very low on the priority chain
- Grandchildren: Specific rules — inherit only through their deceased parent's share

### Indian Succession Act (applies to Christians and Parsis)
Spouse + children inherit equally.
If no children: spouse gets half, other half to parents/siblings.
No Class I/II distinction — more proportional distribution.

### Muslim Personal Law
Wife gets 1/8th if there are children, 1/4th if no children.
Daughters get half the share of sons.
Father, mother, and siblings have fixed fractional shares.
A Muslim can will only 1/3rd of their property — the rest must follow Sharia distribution.
No concept of Class I/II — all shares are fixed fractions defined by Sharia.

### KEY RULE FOR THE DASHBOARD:
When a beneficiary logs in, the dashboard should ask:
"What was [deceased's name]'s religion?" and display the relevant inheritance law
framework alongside each asset's instructions. This changes which documents are needed
and what legal rights the beneficiary has.

---

## ASSET TYPE 1 — BANK ACCOUNT (Savings / Current / NRO)

### The Two Scenarios

**SCENARIO A: Nominee is registered**
This is the simpler path. The nominee can claim directly from the bank.
The nominee is NOT the legal owner — they are a trustee/custodian.
But practically, banks release funds to nominees without asking for court documents.

Step-by-step:
1. Visit the branch where the account is held (must be the specific branch, not any branch)
2. Ask for the "Death Claim Form" (each bank has its own form)
3. Submit:
   - Completed claim form
   - Original death certificate + 2 photocopies
   - Nominee's Aadhaar card (original + photocopy)
   - Nominee's PAN card
   - Nominee's passport photo
   - Cancelled cheque or passbook of nominee's account (for transfer)
4. Bank verifies documents — typically 1–3 weeks
5. Funds transferred to nominee's account

**SCENARIO B: No nominee registered**
More complex. Requires legal documentation.

If amount is small (typically under ₹50,000–₹1,00,000 depending on bank):
Bank may release on basis of an indemnity bond + legal heir certificate alone.

If amount is large:
Succession certificate from district court is required.
This takes 3–6 months.

Step-by-step for no nominee:
1. Obtain legal heir certificate from tehsildar
2. File succession certificate petition in district civil court
3. Court publishes notice — 45-day objection window
4. No objections → court issues succession certificate (3–6 months total)
5. Visit bank with: succession certificate + death certificate + legal heir certificate + KYC of all heirs
6. Bank releases funds

### State-Specific Variations
Maharashtra: Banks in Mumbai may require additional attestation.
West Bengal: More likely to insist on court documents even for smaller amounts.
Tamil Nadu / Karnataka / AP: Generally follow standard RBI guidelines without extra state requirements.
Punjab: Some rural cooperative banks have informal settlement processes for small amounts.

### Relationship-Specific Rules
Spouse: Nominee or Class I heir — strongest claim, typically no challenge.
Children: Class I heirs — equal claim alongside spouse.
Mother: Class I heir — shares with spouse and children.
Father: Class II heir — claim only if spouse, children, mother are all absent.
Brother/Sister: Class II — very weak claim if any Class I heirs exist.

### What Paradosis Generates
Pre-filled bank claim form (bank-specific: SBI / HDFC / Canara / PNB / ICICI etc.)
Pre-filled succession certificate petition (if no nominee)
Checklist of documents to bring to the branch

---

## ASSET TYPE 2 — FIXED DEPOSIT (FD)

### The Two Scenarios

FDs follow almost exactly the same rules as bank accounts — same institution, same process.

**SCENARIO A: Nominee registered**
Bank releases FD proceeds (principal + accrued interest) to nominee directly.
Premature closure permitted on death — no penalty applies.
Process: Same as bank account claim above. Provide FD receipt/certificate along with other docs.

**SCENARIO B: No nominee**
For FDs below ₹5 lakh: Legal heir certificate + indemnity bond typically sufficient.
For FDs above ₹5 lakh: Succession certificate required.

### Joint FD Special Rule
If FD is in joint names with "Either or Survivor" clause:
Surviving account holder can continue or close the FD without any inheritance documents.
If joint FD has no survivor clause:
Both parties' heirs must jointly claim or mutually agree.

### Relationship-Specific Rules
Same as bank account — nominee has first claim, then Class I heirs.

### What Paradosis Generates
Pre-filled FD claim form
FD receipt number pre-filled in all forms
Note about premature closure waiver on death

---

## ASSET TYPE 3 — REAL ESTATE / PROPERTY

### The Most Complex Asset — Requires Most Steps

Property inheritance has two parts:
Part A: Establishing your legal right (mutation/title)
Part B: Transferring the title formally if needed for sale/mortgage

### WITH A WILL
If the vault owner had a registered/signed will:
1. Obtain death certificate
2. Obtain probate of will from High Court (MANDATORY in some states — see below)
3. Apply for mutation at local municipal authority / tehsildar with:
   - Probate order (or certified will if probate not required in your state)
   - Death certificate
   - Property documents (sale deed, previous title deed)
   - Property tax receipts (latest)
   - Identity proof of heir
4. Mutation updates records — now you are the taxpayer of record
5. For clean title (for sale/mortgage): register a Partition Deed or Settlement Deed
   at the local Sub-Registrar office

**Probate — which states require it:**
MANDATORY: Mumbai, Kolkata, Chennai (for properties in these cities)
NOT required: Delhi, Bangalore, Hyderabad, Pune (outside Mumbai), most other states
CASE-BY-CASE: Some High Courts in other states require it for disputed wills

### WITHOUT A WILL (more common)
1. Obtain death certificate
2. Obtain legal heir certificate from tehsildar (proves who the heirs are)
3. Apply for mutation at local authority with:
   - Legal heir certificate
   - Death certificate
   - Property documents
   - Property tax receipts
   - NOC (No Objection Certificate) from other heirs if only one heir is claiming
   - Affidavit of heirship
4. Mutation completed — typically 30–90 days
5. If multiple heirs want to split property:
   Execute a Partition Deed — must be registered at Sub-Registrar
   Stamp duty on partition deed varies by state (often 1–5% of property value)
6. If one heir wants to take full ownership (others relinquish):
   Other heirs sign a Relinquishment Deed — registered at Sub-Registrar

### State-Specific Variations (Property)
Maharashtra:
  Mutation done at local municipal authority (BMC in Mumbai, panchayat in villages)
  Use MahaBhulekh portal for online mutation in many areas
  Heirship certificate from court (not tehsildar) often required

Tamil Nadu:
  Mutation at local panchayat or municipality
  Patta transfer (for agricultural land) — separate process at Tahsildar office
  Higher stamp duty on partition deeds than most states

Karnataka:
  Online mutation through Bhoomi portal
  RTC (Record of Rights, Tenancy and Crops) must be updated for agricultural land

Delhi:
  Mutation at local municipal corporation (MCD/NDMC/DCB depending on area)
  Surviving Member Certificate needed (from Revenue Department, not court)

Andhra Pradesh / Telangana:
  Online Mee Seva centers handle mutation applications
  Pahani (land record) must be updated for agricultural land

Gujarat:
  7/12 extract must be updated (for agricultural land)
  Mutation at local Mamlatdar office

West Bengal:
  Mutation at local BL&LRO (Block Land and Land Reforms Officer)
  More likely to require court-issued certificate even for small properties

Kerala:
  Thandapper (land register) must be updated
  Village Officer issues legal heirship certificate

### Relationship-Specific Rules for Property

Hindu law (self-acquired property of deceased):
Spouse: Class I — gets share equal to each child
Son: Class I — equal share with spouse
Daughter: Class I — EQUAL rights as son (since Hindu Succession Amendment 2005)
  Note: Married daughters have SAME rights as sons — common misconception that they don't
Mother: Class I — shares equally with spouse and children
Father: Class II — only if no Class I heirs exist
Brother/Sister: Class II — very unlikely to inherit if spouse or children exist

Hindu law (ancestral property):
Son and Daughter: Rights by birth (coparcenary rights)
Spouse: Share in husband's/wife's coparcenary interest
This is more complex — recommend a lawyer if ancestral property is involved

Muslim law:
Wife gets 1/8th if children exist
Daughter gets half the share of a son
If only daughters and no son: daughters get 2/3rds total, remaining to other heirs
Father is a primary heir (unlike Hindu law where he's Class II)

### What Paradosis Generates
Pre-filled mutation application (generic template with state noted)
Pre-filled legal heir certificate application
Affidavit of heirship (draft)
Relinquishment deed (draft, for other heirs)
State-specific office details and portal links

---

## ASSET TYPE 4 — INSURANCE (Life Insurance / LIC / Private)

### The Cleanest Inheritance Process

Insurance is the most straightforward — primarily because IRDAI (the regulator)
has strict rules requiring insurers to settle claims quickly.

**SCENARIO A: Nominee registered**
Process:
1. Contact insurer's branch or nearest office
2. Intimate the death — insurer assigns a claim number
3. Submit:
   - Filled Claim Form (Form A for LIC; each private insurer has their own)
   - Original Policy Document
   - Original Death Certificate
   - Nominee's Aadhaar + PAN
   - Nominee's bank details (cancelled cheque)
   - Hospital records / post-mortem report (for accidental/early death claims)
   - If death within 3 years of policy: insurer may investigate more thoroughly
4. Insurer verifies — IRDAI mandates settlement within 30 days
5. Claim amount credited directly to nominee's bank account

**SCENARIO B: No nominee**
Succession certificate required.
Submit succession certificate + legal heir certificate + all above documents.

### Accidental Death — Additional Documents
FIR copy (for accidents, homicide)
Post-mortem report
Panchanama (scene investigation report)
These trigger additional EDLI / accidental benefit riders if applicable.

### Early Death (within 3 years of policy start)
Insurer can investigate for fraud.
Additional documents: Attending physician's statement, hospital records.
Repudiation (rejection) is more common — right to appeal exists.

### State Variations for Insurance
Insurance is nationally regulated by IRDAI — no state-specific variations.
However LIC offices are city-specific and must be contacted in the city where policy was issued.
Private insurers often have centralized claim processing — call their national helpline.

### Relationship-Specific Rules
Nominee gets the money directly regardless of legal heir status.
However: Legal heirs CAN challenge nominee if they believe the nomination was invalid or coerced.
IRDAI 2015 amendment: Insurance money goes to nominee as absolute owner (unlike bank accounts
where nominee is just a trustee). The 2023 Insurance Amendment further strengthened this.
This makes insurance the SAFEST asset to protect — nominee = owner.

### What Paradosis Generates
Pre-filled claim form (LIC Form A + generic private insurer form)
Policy number, sum assured, and insurer details pre-filled
List of additional documents for accidental death claims
IRDAI consumer helpline: 1800-4254-732

---

## ASSET TYPE 5 — MUTUAL FUNDS

### Process (called "Transmission" in mutual fund terminology)

**SCENARIO A: Nominee registered**
Contact the AMC (Asset Management Company) or registrar (CAMS/KFintech).
All major AMCs use CAMS or KFintech as their registrar — one form covers all schemes.

Step-by-step:
1. Download Transmission Request Form from CAMS website (cams.com) or AMC website
2. Submit:
   - Transmission Request Form
   - Death certificate (attested by Gazetted Officer or notarised)
   - KYC of nominee (Aadhaar + PAN — nominee must be KYC compliant)
   - Bank proof of nominee (cancelled cheque)
   - Nominee's passport photo
3. CAMS/KFintech processes — typically 30–45 days
4. Units either transmitted to nominee's folio OR redeemed and paid as cash

**SCENARIO B: No nominee**
Submit all above + Succession certificate (court-issued).

### If Folio Has Multiple Schemes
One transmission request can cover all schemes in the same folio.
If schemes are in different AMCs: separate transmission per AMC.
But since most AMCs use CAMS, one submission to CAMS can handle multiple AMCs.

### SEBI September 2024 Rule Change
SEBI has standardized nomination procedures across mutual funds and demat accounts.
Nominees must now provide PAN, Aadhaar, or passport number for better tracking.
Joint folio holders: nomination is optional for joint holdings.
Singly held folios: nomination mandatory or explicit opt-out required.

### State Variations
No state-specific variations. SEBI regulates nationally.
Process is same whether AMC is in Mumbai, Chennai, or Bangalore.

### Relationship-Specific Rules
Same as insurance — nominee is treated as beneficial owner for mutual funds.
Supreme Court 2023 judgment (Shakti Yezdani case) clarified: for securities/MF units,
nominee receives units as trustee on behalf of legal heirs. Legal heirs can still claim.
Practically: nominee receives units first, legal heirs must separately pursue if they wish.

### What Paradosis Generates
Pre-filled CAMS Transmission Request Form
Pre-filled KFintech Transmission Request Form
Folio number and AMC details pre-filled
CAMS helpline: 1800-425-2267

---

## ASSET TYPE 6 — STOCKS / DEMAT ACCOUNT

### Process (called "Transmission" for demat accounts)

**SCENARIO A: Nominee registered**

Contact the depository participant (DP) — the broker (Zerodha, HDFC Securities, etc.)
or the depository directly (CDSL / NSDL).

Step-by-step:
1. Submit Transmission Request to DP with:
   - Transmission Request Form (DP-specific form)
   - Original death certificate + notarised copy
   - Nominee's KYC — Aadhaar + PAN
   - Nominee's demat account details (DPID + Client ID) — they need their OWN demat account
   - Copy of nominee's bank account
2. DP verifies and transfers shares to nominee's demat account — 30–60 days
3. Shares can then be sold or held

**SCENARIO B: No nominee**
Succession certificate required.
Nominee's demat account still needed — shares are transmitted, not given as cash.

### If Shares Are Physical (Old Share Certificates)
Physical shares still exist for older companies.
Transfer to demat requires:
- Share Transfer Form (SH-4) — signed by heir
- Original share certificate
- Death certificate + succession certificate
- Submit to Company's Registrar (e.g., Link Intime, KFin)
This process takes 3–6 months.

### Listed vs Unlisted Companies
Listed companies: Standard transmission process above.
Unlisted private companies: Contact company's registered office directly.
  Require: succession certificate + share certificate + forms per company's Articles of Association.

### State Variations
SEBI/depositories regulate nationally — no state variations.
But if company's registrar is in a specific state, you may need to visit their office.

### Relationship-Specific Rules
Supreme Court 2023 (Shakti Yezdani): Nominee for demat/shares acts as trustee.
Legal heirs can ultimately claim beneficial ownership.
Practically: Nominee gets shares first, family must agree on distribution.

### What Paradosis Generates
Pre-filled Transmission Request Form (CDSL format + NSDL format)
Demat account details, DPID, Client ID pre-filled
DP contact details (from vault — broker name)
Warning if nominee doesn't have their own demat account

---

## ASSET TYPE 7 — CRYPTO WALLET

### The Only Asset Where There Is No Legal Process

There is no inheritance law, no regulatory framework, and no institution to contact.
If the private key is not accessible: the money is permanently gone.

### What Paradosis Does (Unique Value)
This is where Paradosis is completely different from all other solutions.
The smart contract holds the assignment. At execution, crypto routes automatically
to the beneficiary's pre-registered wallet address.
The beneficiary does NOT need to know the private key.
The beneficiary does NOT need a succession certificate.
The beneficiary DOES need their own crypto wallet to receive funds.

### What the Beneficiary Must Do After Receiving
Nothing legally required. The crypto is in their wallet — it's theirs.
However, for tax purposes: India treats crypto as Virtual Digital Assets (VDA).
If the beneficiary sells or transfers the crypto, they must pay 30% flat tax on gains.
They should maintain a record of the date they received the crypto and its value at that time
(cost basis for tax purposes).

### If Crypto Is on an Exchange (CoinDCX, WazirX, etc.)
Exchange-held crypto: Exchange's own policy applies.
Most Indian exchanges require: Death certificate + KYC of nominee + succession certificate.
Contact the exchange's support directly — process varies by exchange.
Paradosis cannot automatically route exchange-held crypto — only wallet crypto.

### State Variations
None — crypto has no state jurisdiction.

### Relationship-Specific Rules
None — crypto has no legal heir framework.
Whoever has the wallet or whoever receives from the smart contract: that's the owner.

### What Paradosis Generates
Simulated transaction reference (in demo)
Tax guidance note: 30% VDA tax on future gains
Instructions for exchange-held crypto (contact exchange with death cert + KYC)

---

## ASSET TYPE 8 — VEHICLE (Car / Two-Wheeler / Commercial Vehicle)

### The Process

Vehicle title is transferred through the RTO (Regional Transport Office).
The vehicle must be transferred to the heir's name before it can be sold or insured properly.

**Documents Required:**
- Death certificate
- Legal heir certificate
- Original RC (Registration Certificate) — the vehicle's ownership document
- Form 31 (Application for Transfer of Ownership to Legal Heir) — available at RTO
- Current vehicle insurance papers
- PUC (Pollution Under Control) certificate (must be valid)
- Heir's ID proof and address proof
- Heir's passport photo
- Form 28 (NOC from RTO if transferring to different state)
- If loan on vehicle: NOC from financier (bank/NBFC) after loan closure

**Process:**
1. Obtain legal heir certificate
2. Visit the RTO where vehicle was registered (not any RTO — must be the registered RTO)
3. Submit Form 31 + all documents
4. Pay transfer fee (varies: ₹300–1,500 depending on vehicle type and state)
5. RTO inspects vehicle (sometimes required, sometimes not)
6. RC updated in heir's name — 2–4 weeks

### State Variations (Vehicle)
All states use Form 31 nationally — CMVR (Central Motor Vehicles Rules) governs this.
However:
Fees vary by state — Maharashtra and Delhi charge more than smaller states.
Some states require physical inspection, others don't.
Tamil Nadu: RTO offices accept online applications via TN Transport portal.
Karnataka: Parivahan portal enables online RC transfer applications.
Delhi: Fully online via Parivahan.gov.in
Most states: Use Parivahan.gov.in — allows online submission in participating RTOs.

### Loan on Vehicle
If the vehicle has an active loan:
The loan must be settled (or transferred to heir's name) before title transfer.
Financier must issue NOC after loan closure.
Submit NOC with Form 31.

### Relationship Rules
RTO does not distinguish between relationships for vehicle transfer.
Legal heir certificate is sufficient regardless of relationship.
If multiple heirs: they must agree on who gets the vehicle, or sell and split proceeds.

### What Paradosis Generates
Pre-filled Form 31
RC number and RTO details pre-filled
Parivahan portal link for online states
Checklist including loan NOC if applicable

---

## ASSET TYPE 9 — EPF / PPF

### EPF (Employee Provident Fund) — Managed by EPFO

**If nominee is registered:**
Nominee files composite death claim via:
Option A (Online — preferred): EPFO UAN portal (epfindia.gov.in)
  Login with UAN → Claims → Composite Death Claim (Form 20 + 5IF + 10D)
  Upload: Death certificate, Aadhaar of claimant, bank proof
  EPFO targets: settlement within 7 days of complete submission

Option B (Offline):
  Fill EPF Form 20 (PF withdrawal) — get from employer or EPFO office
  EPF Form 5IF (EDLI insurance claim — up to ₹7 lakh)
  EPF Form 10D (Pension — for widow/children pension)
  Submit through the last employer who must countersign

**If no nominee is registered:**
Legal heir certificate + succession certificate (for amounts above EPFO's threshold).
Submit to regional EPFO office.

**Multiple EPF accounts (previous jobs):**
UAN links all accounts — claim covers all under one UAN.
Pre-UAN accounts (before 2014): Contact previous employer's EPFO regional office.

### PPF (Public Provident Fund) — Managed by Bank / Post Office

PPF nominee process uses Form G (available at any bank/post office branch).

**If nominee registered:**
Fill Form G + submit:
  - Death certificate
  - Nominee's identity proof
  - PPF passbook of deceased
  - Nominee's bank details
  - Indemnity bond (if multiple nominees or amount is large)
Bank / Post Office closes the account and transfers balance + interest to nominee.
Timeline: 15 days with all documents.
Tax: PPF maturity amount is completely TAX-FREE for nominee/heir. No tax even on inheritance.

**If no nominee:**
PPF amount below ₹1 lakh: Legal heir certificate sufficient.
PPF amount above ₹1 lakh: Succession certificate required.

### State Variations for EPF/PPF
EPF: No state variations — EPFO is a central body, uniform process.
PPF: Bank/post office where account is held determines the branch to approach.
  If account is in State Bank of Hyderabad (now SBI), go to that specific branch.

### Relationship-Specific Rules
EPF: Family members defined by EPF Act:
  Spouse (widow/widower), sons (unmarried), daughters (unmarried), dependent parents.
  Married daughters and independent sons may NOT qualify as "family" under EPF Act
  but CAN claim as legal heirs if no registered family nominee exists.
PPF: No restriction — any nominee can claim regardless of relationship.

### What Paradosis Generates
Pre-filled EPF Form 20
Pre-filled EPF Form 5IF (EDLI insurance)
Pre-filled PPF Form G
UAN number and PF account number pre-filled
EPFO helpline: 1800-118-005

---

## ASSET TYPE 10 — GOLD / JEWELLERY

### Unique Characteristics
Gold and jewellery have NO registration, NO nominee system, and NO institutional process.
Whoever physically possesses it, possesses it.
But for legal clarity (especially for sale, bank loan, or family peace):
a documented transfer is advisable.

### The Practical Process

**If stored at home:**
Heirs physically take possession.
For legal peace among multiple heirs: execute a Family Settlement Deed.
This is a notarised/registered document where all heirs agree on who gets what.
Stamp duty: Varies by state, typically low for family settlements.
Registration: Not mandatory but strongly advised.

**If stored in bank locker:**
Bank locker access after death:
  - Submit death certificate + KYC of all heirs to the bank
  - If joint locker: surviving holder can continue access
  - If sole holder with nominee: nominee + bank staff open locker in presence of each other
    Contents inventoried and handed to nominee
  - If no nominee: legal heir certificate + succession certificate required
  - Bank may require presence of all legal heirs at locker opening

**If stored in a locker at a jeweller/vaulting company:**
Present death certificate + legal heir certificate to the company.
Company policy governs — no universal standard.

### Tax Implications
Inherited gold is NOT taxed at time of inheritance (no inheritance tax in India).
If the heir SELLS the gold later:
  Long-term capital gains (held > 3 years): 20% tax with indexation benefit.
  Short-term capital gains (held ≤ 3 years): Added to income and taxed at slab rate.
  Cost basis: The original purchase price of the deceased is carried forward.

### State Variations
No state-specific legal process — gold has no registration system.
Bank locker rules are nationally governed by RBI.
Stamp duty on Family Settlement Deed varies by state.

### Relationship-Specific Rules
Under Hindu law: All Class I heirs have equal claim to jointly held gold.
Under Muslim law: Fixed fractional shares apply.
Practically: Family agreement (settlement deed) is the cleanest resolution.
Court intervention only if family disagrees.

### What Paradosis Generates
Family Settlement Deed template (draft)
Bank locker claim letter template (pre-filled with bank, branch, locker number)
Inventory checklist for heirs to document contents at locker opening
Note about capital gains tax on future sale

---

## DASHBOARD IMPLEMENTATION — THE INHERITANCE GUIDE FEATURE

### Where This Lives
Inside the beneficiary's unlocked portal, each asset card has an "Inheritance Guide" button.
Clicking it opens a step-by-step guide specific to:
- That asset type
- The deceased's religion (pulled from vault owner's profile)
- The beneficiary's relationship to the deceased (pulled from beneficiary record)
- Whether a nominee was registered (pulled from asset record)

### The Guide Component Structure

```
AssetInheritanceGuide
├── StatusBanner         — "You are the registered nominee" / "No nominee — succession certificate needed"
├── RelationshipNote     — "As the spouse, you are a Class I heir under Hindu law"
├── DocumentChecklist    — All documents needed, pre-filled where Paradosis has the data
├── StepList             — Numbered steps, each expandable with detail
├── OfficeLocator        — Which office/branch/portal to go to
├── TimeEstimate         — "Expected time: 2–4 weeks" or "3–6 months if court needed"
├── FormDownloads        — Pre-filled PDFs generated by Paradosis
├── StateVariationNote   — If state-specific rules apply
└── SupportCard          — "Need help? Connect with a CA/Lawyer via Paradosis"
```

### The Decision Tree Logic (Backend)

For each asset, the backend runs this logic to determine which instructions to show:

```python
def get_inheritance_path(asset, beneficiary, owner_profile):

    religion = owner_profile.religion
    relationship = beneficiary.relationship
    nominee_registered = asset.nominee_registered
    asset_type = asset.asset_type
    state = owner_profile.state

    path = InheritancePath()
    path.asset_type = asset_type

    # Nominee path vs non-nominee path
    if nominee_registered:
        path.primary_route = "nominee_claim"
        path.complexity = "simple"
        path.time_estimate = "2–4 weeks"
    else:
        path.primary_route = "succession_certificate"
        path.complexity = "complex"
        path.time_estimate = "3–6 months"

    # Religion-based legal framework
    if religion == "Hindu" or religion in ["Buddhist", "Jain", "Sikh"]:
        path.governing_law = "Hindu Succession Act, 1956"
        path.class_1_heir = relationship in [
            "spouse", "son", "daughter", "mother"
        ]
    elif religion == "Muslim":
        path.governing_law = "Muslim Personal Law"
        path.fixed_share = get_muslim_share(relationship)
    else:  # Christian, Parsi, others
        path.governing_law = "Indian Succession Act, 1925"

    # State-specific variations
    path.probate_required = (
        asset_type == "property" and
        state in ["Maharashtra", "West Bengal", "Tamil Nadu"] and
        owner_profile.city in ["Mumbai", "Kolkata", "Chennai"]
    )

    path.legal_heir_cert_name = get_state_cert_name(state)
    path.mutation_portal = get_state_mutation_portal(state)

    return path
```

### Document Checklist Component

Each document in the checklist has three states:
- ✅ Paradosis has this (pre-filled form downloadable)
- 📋 You need to obtain this (with instructions on where)
- ⚠️ Required only in your situation (conditional)

Example for bank account (nominee registered, Hindu, spouse):
```
Documents for HDFC Salary Account Claim:

✅ Pre-filled HDFC Claim Form — [Download PDF]
📋 Death Certificate — Download from DigiLocker or collect from municipal office
📋 Your Aadhaar Card — Original + photocopy
📋 Your PAN Card — Original + photocopy
📋 Cancelled cheque (your bank account) — From your bank
📋 Passport photo (2 copies)
⚠️ Succession Certificate — NOT required (nominee is registered)

As spouse (Class I heir under Hindu law), you have the
strongest legal claim. The bank cannot deny this claim with
proper documentation.
```

### Step Component (Expandable)

```
Step 1: Visit the branch where the account is held
  ↳ This must be the specific branch, not any HDFC branch.
    Branch: HDFC Bank, Anna Nagar — as recorded in the vault.
    Opening hours: Mon–Sat, 10AM–4PM.
    Ask for: "Death Claim Settlement" at the customer service desk.

Step 2: Submit the claim form and documents
  ↳ Hand over all documents in a single envelope.
    Keep a photocopy of everything before submitting.
    Ask for an acknowledgement receipt with timestamp.

Step 3: Bank verification
  ↳ Bank will verify documents — typically 1–3 weeks.
    If they need more documents, they will call you.
    HDFC Bank claim helpline: 1800-202-6161

Step 4: Funds transferred
  ↳ Amount will be transferred directly to your registered bank account.
    You will receive an SMS when transferred.
```

### Time and Cost Estimator

Each guide shows:
```
┌────────────────────────────────────┐
│ ⏱ Time Estimate                    │
│ Best case: 2 weeks                 │
│ Typical: 3–4 weeks                 │
│ If complications: 2–3 months       │
│                                    │
│ 💰 Estimated Costs                 │
│ Bank claim: Free                   │
│ Notarisation (if needed): ₹100–500 │
│ Legal heir certificate: ₹50–200    │
│ Lawyer (if needed): ₹5,000+        │
└────────────────────────────────────┘
```

### State Selector

Since the vault stores the owner's state, the guide auto-adjusts.
But the beneficiary can also manually change the state if the asset is in
a different state than the owner's address. A small "Change state" link
allows this override.

### The Religion Warning Banner

If religion is not set in the vault owner's profile, the guide shows:
```
⚠️ Religion not specified in vault
The legal process for inheritance varies by religion.
Please select the vault owner's religion to see the
correct legal framework for your situation:
[Hindu] [Muslim] [Christian] [Parsi] [Other]
```

---

## QUICK REFERENCE TABLE

| Asset | With Nominee | Without Nominee | Key Document | Time |
|---|---|---|---|---|
| Bank Account | Claim form + death cert | Succession certificate | Bank claim form | 2–4 wks / 3–6 mo |
| Fixed Deposit | Same as bank | Same as bank | FD claim form | 2–4 wks / 3–6 mo |
| Real Estate | Mutation + probate (some states) | Legal heir cert + mutation | Mutation application | 1–6 months |
| Insurance | Claim form (30-day IRDAI mandate) | Succession certificate | Insurer claim form | 2–4 weeks |
| Mutual Fund | CAMS/KFin transmission form | Succession certificate | Transmission form | 30–45 days |
| Stocks/Demat | Demat transmission form | Succession certificate | DP transmission form | 30–60 days |
| Crypto | Auto via Paradosis smart contract | N/A (no framework) | None | Instant |
| Vehicle | RTO Form 31 | Legal heir cert + Form 31 | Form 31 | 2–4 weeks |
| EPF/PPF | Form 20 / Form G | Legal heir cert + succ. cert | EPFO forms | 7–30 days |
| Gold/Jewellery | Physical possession | Family settlement deed | Settlement deed | Immediate |
