import { DashboardUiThemeProvider } from "@/components/dashboard-ui-theme";
import { DashboardAntdProviders } from "@/components/dashboard-antd-providers";
import { AuthGate } from "@/components/photographer/auth-gate";
import { PhotographerShell } from "@/components/photographer/photographer-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <DashboardUiThemeProvider>
        <DashboardAntdProviders>
          <PhotographerShell>{children}</PhotographerShell>
        </DashboardAntdProviders>
      </DashboardUiThemeProvider>
    </AuthGate>
  );
}
