import sys
import re

content = open(r'c:\Meraki\frontend\app\beneficiary\dashboard\page.tsx', 'r', encoding='utf-8').read()

componentDef = """
const AssetDetailsCard = ({ type, details }: { type: string, details: any }) => {
    if (!details || Object.keys(details).length === 0) {
        return <p className="text-sm text-muted-foreground">No additional details available.</p>;
    }

    const renderField = (label: string, value: any) => (
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground capitalize">{label.replace(/_/g, " ")}</span>
            <span className="text-sm font-medium text-foreground">{value !== null && value !== undefined && value !== "" ? String(value) : "—"}</span>
        </div>
    );

    if (type === "bank_account" || type === "fixed_deposit") {
        return (
            <div className="grid sm:grid-cols-2 gap-4 bg-background border border-border p-4 rounded-xl">
                {details.account_type && renderField("Account Type", details.account_type)}
                {details.branch_address && renderField("Branch", details.branch_address)}
                {details.nominee_registered !== undefined && renderField("Nominee Status", details.nominee_registered === "true" || details.nominee_registered === true ? "Registered" : "Not Registered")}
                {details.nominee_name && renderField("Nominee Name", details.nominee_name)}
                {Object.entries(details).filter(([k]) => !['account_type', 'branch_address', 'nominee_registered', 'nominee_name'].includes(k)).map(([k, v]) => <React.Fragment key={k}>{renderField(k, v)}</React.Fragment>)}
            </div>
        );
    }

    if (type === "crypto_wallet") {
        return (
            <div className="grid sm:grid-cols-2 gap-4 bg-[#f8f9fa] dark:bg-[#1a1a1a] border border-border p-4 rounded-xl">
                {details.wallet_address && (
                    <div className="col-span-2">
                        <span className="text-xs text-muted-foreground">Wallet Address</span>
                        <div className="font-mono text-xs bg-muted p-2 rounded-md break-all mt-1">{details.wallet_address}</div>
                    </div>
                )}
                {details.chain && renderField("Network/Chain", details.chain)}
                {details.wallet_type && renderField("Wallet Type", details.wallet_type)}
                {details.has_hardware_wallet !== undefined && renderField("Hardware Wallet", details.has_hardware_wallet === "true" || details.has_hardware_wallet === true ? "Yes" : "No")}
                {Object.entries(details).filter(([k]) => !['wallet_address', 'chain', 'wallet_type', 'has_hardware_wallet'].includes(k)).map(([k, v]) => <React.Fragment key={k}>{renderField(k, v)}</React.Fragment>)}
            </div>
        );
    }

    if (type === "property") {
        return (
            <div className="grid sm:grid-cols-2 gap-4 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-xl">
                {details.registration_number && renderField("Registration No.", details.registration_number)}
                {details.survey_number && renderField("Survey No.", details.survey_number)}
                {details.area_sqft && renderField("Area (Sq Ft)", details.area_sqft)}
                {details.mortgage_status && renderField("Mortgage Status", details.mortgage_status)}
                {details.registrar_office && renderField("Registrar Office", details.registrar_office)}
                {Object.entries(details).filter(([k]) => !['registration_number', 'survey_number', 'area_sqft', 'mortgage_status', 'registrar_office'].includes(k)).map(([k, v]) => <React.Fragment key={k}>{renderField(k, v)}</React.Fragment>)}
            </div>
        );
    }
    
    if (type === "mutual_fund" || type === "stocks_demat") {
        return (
            <div className="grid sm:grid-cols-2 gap-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 p-4 rounded-xl">
                {details.folio_number && renderField("Folio Number", details.folio_number)}
                {(details.amc_name || details.broker_name) && renderField("AMC / Broker", details.amc_name || details.broker_name)}
                {details.scheme_name && renderField("Scheme Name", details.scheme_name)}
                {details.dp_id && renderField("DP ID", details.dp_id)}
                {Object.entries(details).filter(([k]) => !['folio_number', 'amc_name', 'broker_name', 'scheme_name', 'dp_id'].includes(k)).map(([k, v]) => <React.Fragment key={k}>{renderField(k, v)}</React.Fragment>)}
            </div>
        );
    }

    // Generic Fallback
    return (
        <div className="grid sm:grid-cols-2 gap-3 bg-background border border-border p-4 rounded-xl">
            {Object.entries(details).map(([key, val]) => (
                <React.Fragment key={key}>{renderField(key, val)}</React.Fragment>
            ))}
        </div>
    );
};
"""

content = content.replace("export default function BeneficiaryDashboard() {", componentDef + "\nexport default function BeneficiaryDashboard() {")

old_details_regex = r'\{Object\.keys\(asset\.details \|\| \{\}\)\.length > 0 \? \([\s\S]*?No additional details available\.</p>\n\s*\)\}'
new_details = '<AssetDetailsCard type={asset.asset_type} details={asset.details} />'

content = re.sub(old_details_regex, new_details, content)

with open(r'c:\Meraki\frontend\app\beneficiary\dashboard\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

