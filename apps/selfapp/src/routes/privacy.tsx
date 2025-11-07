import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
	return (
		<div className="min-h-screen app-bg-base">
			<div className="container mx-auto px-4 py-12 max-w-4xl">
				<div className="flex items-center gap-3 mb-8">
					<Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
					<h1 className="text-4xl font-bold app-text-strong">Privacy Policy</h1>
				</div>

				<Card className="mb-6">
					<CardContent className="pt-6">
						<p className="app-text-subtle mb-4">
							<strong>Last Updated:</strong> November 7, 2025
						</p>
						<p className="app-text-subtle">
							At TrueOrient, we are committed to protecting your privacy and
							ensuring the security of your personal information. This Privacy
							Policy explains how we collect, use, and safeguard your data.
						</p>
					</CardContent>
				</Card>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>1. Information We Collect</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h3 className="font-semibold app-text-strong mb-2">
								1.1 Account Information
							</h3>
							<p className="app-text-subtle">
								When you create an account, we collect your email address, name,
								and authentication credentials managed through AWS Cognito.
							</p>
						</div>
						<div>
							<h3 className="font-semibold app-text-strong mb-2">
								1.2 Performance Tracking Data
							</h3>
							<p className="app-text-subtle">
								We collect the information you provide when using our performance
								tracking features, including daily goals, execution notes,
								performance ratings, time tracking data, and reflection entries.
							</p>
						</div>
						<div>
							<h3 className="font-semibold app-text-strong mb-2">
								1.3 Usage Information
							</h3>
							<p className="app-text-subtle">
								We may collect information about how you use our application,
								including access times, pages viewed, and the features you
								interact with.
							</p>
						</div>
					</CardContent>
				</Card>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>2. How We Use Your Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="app-text-subtle">
							We use your information to:
						</p>
						<ul className="list-disc list-inside space-y-2 app-text-subtle ml-4">
							<li>Provide and maintain our service</li>
							<li>Authenticate and secure your account</li>
							<li>Store and display your performance tracking data</li>
							<li>
								Generate insights and analytics based on your logged activities
							</li>
							<li>Improve and optimize our application</li>
							<li>Communicate with you about updates or important information</li>
						</ul>
					</CardContent>
				</Card>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>3. Data Storage and Security</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<h3 className="font-semibold app-text-strong mb-2">
								3.1 Where We Store Your Data
							</h3>
							<p className="app-text-subtle">
								Your data is stored securely on Amazon Web Services (AWS)
								infrastructure. We use AWS DynamoDB for data storage and AWS S3
								for static assets. All data is encrypted at rest and in transit.
							</p>
						</div>
						<div>
							<h3 className="font-semibold app-text-strong mb-2">
								3.2 Security Measures
							</h3>
							<p className="app-text-subtle">
								We implement industry-standard security measures including:
							</p>
							<ul className="list-disc list-inside space-y-2 app-text-subtle ml-4">
								<li>End-to-end encryption for data transmission</li>
								<li>Encrypted storage for all user data</li>
								<li>Secure authentication through AWS Cognito</li>
								<li>Regular security audits and updates</li>
								<li>Access controls and monitoring</li>
							</ul>
						</div>
					</CardContent>
				</Card>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>4. Data Sharing and Disclosure</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="app-text-subtle">
							We do not sell, trade, or rent your personal information to third
							parties. We may share your information only in the following
							circumstances:
						</p>
						<ul className="list-disc list-inside space-y-2 app-text-subtle ml-4">
							<li>
								With your explicit consent for specific purposes
							</li>
							<li>
								To comply with legal obligations, court orders, or legal
								processes
							</li>
							<li>
								To protect our rights, privacy, safety, or property, and that of
								our users
							</li>
							<li>
								With service providers who assist in operating our application
								(e.g., AWS), under strict confidentiality agreements
							</li>
						</ul>
					</CardContent>
				</Card>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>5. Your Rights and Choices</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="app-text-subtle">You have the right to:</p>
						<ul className="list-disc list-inside space-y-2 app-text-subtle ml-4">
							<li>Access your personal data</li>
							<li>Request correction of inaccurate data</li>
							<li>Request deletion of your data</li>
							<li>Export your data in a portable format</li>
							<li>Object to or restrict certain data processing</li>
							<li>Withdraw consent at any time</li>
						</ul>
						<p className="app-text-subtle mt-4">
							To exercise any of these rights, please contact us through your
							account settings or by reaching out to our support team.
						</p>
					</CardContent>
				</Card>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>6. Data Retention</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="app-text-subtle">
							We retain your personal information for as long as your account is
							active or as needed to provide you services. If you choose to
							delete your account, we will delete your data within 30 days,
							except where we are required by law to retain certain information.
						</p>
					</CardContent>
				</Card>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>7. Cookies and Tracking</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="app-text-subtle">
							We use local storage and session storage to maintain your login
							state and application preferences. We do not use third-party
							cookies or tracking technologies for advertising purposes.
						</p>
					</CardContent>
				</Card>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>8. Children's Privacy</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="app-text-subtle">
							Our service is not intended for users under the age of 13. We do
							not knowingly collect personal information from children under 13.
							If we become aware that we have collected personal information
							from a child under 13, we will take steps to delete such
							information.
						</p>
					</CardContent>
				</Card>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>9. Changes to This Privacy Policy</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="app-text-subtle">
							We may update this Privacy Policy from time to time. We will
							notify you of any changes by posting the new Privacy Policy on
							this page and updating the "Last Updated" date. We encourage you
							to review this Privacy Policy periodically.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>10. Contact Us</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="app-text-subtle">
							If you have any questions about this Privacy Policy or our data
							practices, please contact us at:
						</p>
						<p className="app-text-subtle mt-4 font-semibold">
							Email: privacy@trueorient.life
						</p>
						<p className="app-text-subtle">
							Address: TrueOrient, Privacy Department
						</p>
					</CardContent>
				</Card>

				<div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
					<p className="text-sm app-text-subtle">
						<strong>Note:</strong> This privacy policy is designed to be
						transparent and comprehensive. Your trust is important to us, and we
						are committed to protecting your personal information and respecting
						your privacy rights.
					</p>
				</div>
			</div>
		</div>
	);
}
