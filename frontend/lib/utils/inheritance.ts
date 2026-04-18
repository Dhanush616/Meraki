
export type AssetType = 
  | 'bank_account'
  | 'fixed_deposit'
  | 'property'
  | 'insurance'
  | 'mutual_fund'
  | 'stocks_demat'
  | 'crypto_wallet'
  | 'vehicle'
  | 'ppf_epf'
  | 'gold_jewellery'
  | 'business_ownership'
  | 'other';

export interface InheritancePath {
    assetType: AssetType;
    primaryRoute: string;
    complexity: 'simple' | 'moderate' | 'complex';
    timeEstimate: string;
    governingLaw: string;
    positionNote: string;
    steps: { title: string; detail: string; citation?: string }[];
    documents: { name: string; status: 'pre-filled' | 'required' | 'conditional'; description?: string }[];
    officeInfo: string;
    stateNotes?: string;
    costs?: string;
    suggestions: string[];
}

export function getInheritancePath(
    asset: any,
    religion: string,
    relationship: string,
    state: string,
    city: string
): InheritancePath {
    const assetType = asset.asset_type as AssetType;
    const nomineeRegistered = asset.details?.nominee_registered === true || asset.details?.nominee_registered === "true";

    const path: InheritancePath = {
        assetType,
        primaryRoute: nomineeRegistered ? "Nominee Claim" : "Succession Certificate",
        complexity: nomineeRegistered ? 'simple' : 'complex',
        timeEstimate: nomineeRegistered ? "2–4 weeks" : "3–6 months",
        governingLaw: getGoverningLaw(religion),
        positionNote: getPositionNote(religion, relationship),
        steps: [],
        documents: [
            { name: "Death Certificate", status: 'required', description: "Original + 2 photocopies. Step 1 for everything." },
            { name: "Legal Heir Certificate", status: 'required', description: "Issued by Tehsildar/SDM. Proves relationship to deceased." }
        ],
        officeInfo: "",
        costs: nomineeRegistered ? "Minimal (₹100–500 for notarization)" : "Court fees (2–3% of asset value, capped by state limits)",
        suggestions: [
            "Always keep 10-15 photocopies of the Death Certificate.",
            "Obtain the Legal Heir Certificate as early as possible (takes 15-30 days)."
        ]
    };

    // 1. BANK ACCOUNT & FIXED DEPOSIT
    if (assetType === 'bank_account' || assetType === 'fixed_deposit') {
        path.officeInfo = `Visit the SPECIFIC branch: ${asset.details?.institution_name || 'the bank'} where the account is held.`;
        if (nomineeRegistered) {
            path.steps = [
                { title: "Visit the Specific Branch", detail: "Banks typically require claims to be processed at the home branch. Ask for the 'Death Claim Settlement' desk.", citation: "RBI Master Circular on Customer Service (July 2023)" },
                { title: "Submit Claim Form", detail: "Fill the bank's specific Death Claim Form. Submit with your Aadhaar/PAN and a cancelled cheque.", citation: "Section 45ZA to 45ZF of Banking Regulation Act" },
                { title: "Verification Process", detail: "The bank will verify the original death certificate and returning the original after. This takes 1-2 weeks.", citation: "RBI Guidelines (15 days mandate)" },
                { title: "Receive Funds", detail: "Amount will be credited directly to your bank account via NEFT/RTGS." }
            ];
            path.documents.push({ name: "Pre-filled Claim Form", status: 'pre-filled' });
            path.documents.push({ name: "Nominee's Passport Photo", status: 'required' });
        } else {
            path.timeEstimate = "3–6 months (Court Process)";
            path.steps = [
                { title: "Obtain Legal Heir Certificate", detail: "Establishing the legal heirs is mandatory before filing for succession." },
                { title: "File for Succession Certificate", detail: "Required for assets above the bank's threshold (typically ₹50k - ₹1L).", citation: "Indian Succession Act, 1925 (Part X)" },
                { title: "Indemnity & Bonds", detail: "If amount is small, the bank may accept an Indemnity Bond + Legal Heir Certificate.", citation: "IBA Common Operational Guidelines" },
                { title: "Final Disbursement", detail: "Present the court order or signed bonds at the branch to close the account." }
            ];
            path.documents.push({ name: "Succession Certificate", status: 'required', description: "Mandatory for large amounts with no nominee." });
            path.documents.push({ name: "Indemnity Bond", status: 'conditional', description: "Used for small amounts (under ₹1 Lakh)." });
        }
    }

    // 2. PROPERTY
    else if (assetType === 'property') {
        path.complexity = 'complex';
        path.timeEstimate = "3–6 months";
        path.officeInfo = "Apply at the local Municipal Corporation (Urban) or Tehsildar office (Rural).";
        path.steps = [
            { title: "Obtain Death & Legal Heir Certificates", detail: "These are foundational for any property transaction." },
            { title: "Apply for Mutation", detail: "Updates revenue records for property tax. This does not grant title but is necessary.", citation: "State Municipal / Land Revenue Laws" },
            { title: "Check for Probate", detail: "Probate is mandatory if property is in Mumbai, Chennai, or Kolkata and a will is involved.", citation: "Indian Succession Act Section 213 & 57" },
            { title: "Register Partition/Relinquishment Deed", detail: "Required for a clean title if multiple heirs are involved.", citation: "Registration Act, 1908" }
        ];
        if (['Maharashtra', 'West Bengal', 'Tamil Nadu'].includes(state) && ['Mumbai', 'Kolkata', 'Chennai'].includes(city)) {
            path.stateNotes = "MANDATORY: Probate of the Will is required for properties in this city.";
            path.suggestions.push("In Mumbai, the High Court handles probate which takes 6-12 months.");
        }
        path.documents.push({ name: "Original Sale Deed", status: 'required' });
        path.documents.push({ name: "Mutation Application", status: 'pre-filled' });
        path.documents.push({ name: "Property Tax Receipt (Latest)", status: 'required' });
        path.suggestions.push("Daughters have equal rights as sons in ancestral property under the 2005 amendment.");
    }

    // 3. INSURANCE
    else if (assetType === 'insurance') {
        path.complexity = 'simple';
        path.timeEstimate = "2–4 weeks";
        path.officeInfo = "Contact the insurer's claims department or their local branch.";
        path.steps = [
            { title: "Claim Intimation", detail: "Notify the insurer immediately. Early notification helps in faster processing.", citation: "IRDAI Protection of Policyholders' Interests Regulations" },
            { title: "Submit Document Package", detail: "Submit original policy, death cert, and claim form A (for LIC) or equivalent.", citation: "Section 39 of Insurance Act, 1938" },
            { title: "Verification & Settlement", detail: "IRDAI mandates settlement within 30 days of last document submission.", citation: "IRDAI 2017 Guidelines" }
        ];
        path.documents.push({ name: "Original Policy Document", status: 'required' });
        path.documents.push({ name: "Pre-filled Claim Form", status: 'pre-filled' });
        path.suggestions.push("If the death occurred within 3 years of policy start, expect a more detailed 'Early Death' investigation.");
    }

    // 4. MUTUAL FUNDS & STOCKS
    else if (assetType === 'mutual_fund' || assetType === 'stocks_demat') {
        path.primaryRoute = "Transmission";
        path.officeInfo = assetType === 'mutual_fund' ? "CAMS/KFintech handle the majority of AMC transmissions." : "Your DP (Depository Participant) handles the demat transmission.";
        path.steps = [
            { title: "Transmission Request", detail: "Nominee needs their own demat account for stocks or a folio for mutual funds.", citation: "SEBI Circular on Transmission of Securities (2022)" },
            { title: "KYC of Claimant", detail: "Ensure the claimant's PAN and Aadhaar are updated and verified in the system." },
            { title: "Final Transmission", detail: "Shares/Units are transferred. Note: Nominee is a trustee for legal heirs.", citation: "Supreme Court (Shakti Yezdani case 2023)" }
        ];
        path.documents.push({ name: "Transmission Request Form", status: 'pre-filled' });
        path.documents.push({ name: "Your CML (Client Master List)", status: 'required' });
        path.suggestions.push("Nominees are only trustees for securities; legal heirs can still claim ownership unless there is a clear will.");
    }

    // 5. CRYPTO
    else if (assetType === 'crypto_wallet') {
        path.primaryRoute = "Smart Contract Execution";
        path.complexity = 'simple';
        path.timeEstimate = "Instant";
        path.officeInfo = "Automated via Paradosis. No manual claim needed.";
        path.steps = [
            { title: "Automated Routing", detail: "Asset is moved by the protocol to your registered address." },
            { title: "Tax Compliance", detail: "India applies 30% tax on Virtual Digital Assets (VDA) gains.", citation: "Budget 2022 Amendment" }
        ];
        path.documents = [];
        path.suggestions.push("Never share your private keys or seed phrase with anyone pretending to be from Paradosis.");
    }

    // 6. VEHICLE
    else if (assetType === 'vehicle') {
        path.primaryRoute = "RTO Transfer (Form 31)";
        path.officeInfo = `Visit the RTO where the vehicle was registered: ${asset.details?.rto_office || 'the registered RTO'}.`;
        path.steps = [
            { title: "Application for Transfer", detail: "File Form 31 within 3 months of the death to avoid penalties.", citation: "Rule 56 of Central Motor Vehicles Rules, 1989" },
            { title: "Document Submission", detail: "Submit original RC, Insurance, and PUC. RTO may inspect the vehicle." },
            { title: "New RC Issuance", detail: "Ownership is transferred to the legal heir's name in the Vahan portal." }
        ];
        path.documents.push({ name: "Original RC", status: 'required' });
        path.documents.push({ name: "Pre-filled Form 31", status: 'pre-filled' });
        path.suggestions.push("The vehicle must have valid insurance and PUC to process the transfer.");
    }

    // 7. EPF / PPF
    else if (assetType === 'ppf_epf') {
        path.primaryRoute = "Composite Death Claim";
        path.officeInfo = "EPF: EPFO UAN Portal. PPF: Bank/Post Office branch.";
        path.steps = [
            { title: "Composite Death Claim (EPF)", detail: "Login to UAN portal and file combined claim (Form 20/5IF/10D).", citation: "EPFO Circulars" },
            { title: "EDLI Insurance Benefit", detail: "Claim up to ₹7 Lakh insurance if the deceased was an active EPF member.", citation: "EDLI Scheme" },
            { title: "PPF Form G Submission", detail: "Submit Form G to the branch for account closure and fund transfer.", citation: "PPF Scheme, 2019" }
        ];
        path.documents.push({ name: "EPF Form 20 / PPF Form G", status: 'pre-filled' });
        path.suggestions.push("PPF interest is earned until the account is closed; close it quickly to avoid long delays.");
    }

    // 8. GOLD / JEWELLERY
    else if (assetType === 'gold_jewellery') {
        path.primaryRoute = "Family Settlement";
        path.officeInfo = "None. If in bank locker, visit the branch manager.";
        path.steps = [
            { title: "Physical Inventory", detail: "Inventory all items in the presence of other heirs if possible." },
            { title: "Locker Opening", detail: "Bank requires presence of all heirs if no nominee is registered.", citation: "RBI Locker Guidelines 2022" },
            { title: "Family Settlement Deed", detail: "Get a notarized agreement to record the distribution and prevent future litigation." }
        ];
        path.documents.push({ name: "Family Settlement Deed", status: 'pre-filled' });
        path.suggestions.push("Keep records of purchase invoices (if available) for capital gains tax calculations upon sale.");
    }

    return path;
}

function getGoverningLaw(religion: string): string {
    if (["Hindu", "Buddhist", "Jain", "Sikh"].includes(religion)) return "Hindu Succession Act, 1956";
    if (religion === "Muslim") return "Muslim Personal Law (Shariat)";
    return "Indian Succession Act, 1925";
}

function getPositionNote(religion: string, relationship: string): string {
    const isHindu = ["Hindu", "Buddhist", "Jain", "Sikh"].includes(religion);
    const isMuslim = religion === "Muslim";

    if (isHindu) {
        if (["spouse", "son", "daughter", "mother"].includes(relationship.toLowerCase())) {
            return "As a Class I heir under the Hindu Succession Act, you have an immediate and equal right to this asset alongside other Class I heirs. Your claim is legally superior to Class II heirs.";
        }
        if (["father", "brother", "sister"].includes(relationship.toLowerCase())) {
            return "As a Class II heir, your right to this asset only arises if no Class I heirs (spouse, children, or mother) are alive.";
        }
    }
    if (isMuslim) {
        return "Under Muslim Personal Law, fixed fractional shares apply according to Sharia. A person can only will away 1/3rd of their property; the rest must be distributed among legal heirs.";
    }
    return "Your inheritance is governed by the Indian Succession Act, which applies to Christians, Parsis, and others not governed by personal laws.";
}
