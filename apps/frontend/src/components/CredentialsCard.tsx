import { Card, CardContent } from "@/components/ui/card";

const CredentailsCard = ({ children }: { children?: React.ReactNode }) => {
    return (
        <Card className="w-full border-0">
            <CardContent>{children}</CardContent>
        </Card>
    );
};

export default CredentailsCard;
