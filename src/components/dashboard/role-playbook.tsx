import Link from "next/link";

interface RolePlaybookProps {
  steps: Array<{ title: string; detail: string; href?: string }>;
}

export function RolePlaybook({ steps }: RolePlaybookProps) {
  return (
    <details className="mk-playbook">
      <summary>
        <span className="mk-playbook__summary">
          <strong>Role playbook</strong>
          <small>Step-by-step guide for this role</small>
        </span>
        <span className="mk-playbook__chevron" aria-hidden="true">⌄</span>
      </summary>
      <ol>
        {steps.map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong>
            <span>{step.detail}</span>
            {step.href ? <Link href={step.href}>Open area →</Link> : null}
          </li>
        ))}
      </ol>
    </details>
  );
}
