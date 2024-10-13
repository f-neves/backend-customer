import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const routes = Router();

// Função para tratar erros de rotas async com NextFunction corretamente tipado
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next); // Certifica-se de que o next tem o tipo correto
    };
};

// Buscar todos os clientes
routes.get("/customers", asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const customers = await prisma.customer.findMany();
    res.json(customers); // Envia a resposta sem retornar
}));

// Buscar cliente por ID
routes.get("/customers/:id", asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = parseInt(req.params.id); // Certifica-se de que o ID é do tipo correto
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
    }

    res.json(customer);
}));

// Criar um novo cliente
routes.post("/customers", asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, email, document } = req.body;

    if (!name || !email || !document) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }

    const customer = await prisma.customer.create({
        data: { name, email, document }
    });

    res.status(201).json(customer);
}));

// Deletar um cliente por ID
routes.delete("/customers/:id", asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = parseInt(req.params.id);
    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
    }

    await prisma.customer.delete({ where: { id } });
    res.status(204).send();
}));

// Atualizar um cliente por ID
routes.put("/customers/:id", asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = parseInt(req.params.id);
    const { name, email, document } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
        res.status(404).json({ error: "Customer not found" });
        return;
    }

    const customerUpdated = await prisma.customer.update({
        where: { id },
        data: { name, email, document }
    });

    res.json(customerUpdated);
}));

export { routes };
