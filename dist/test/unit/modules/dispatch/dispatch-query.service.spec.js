"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const dispatch_query_service_1 = require("../../../../src/modules/dispatch/services/dispatch-query.service");
describe('DispatchQueryService', () => {
    const makeService = () => {
        const repository = {
            findQueueEntries: jest.fn(),
            findQueueEntryByOrderId: jest.fn(),
        };
        const service = new dispatch_query_service_1.DispatchQueryService(repository);
        return { repository, service };
    };
    it('returns an empty queue when no dispatch candidates are found', async () => {
        const { repository, service } = makeService();
        repository.findQueueEntries.mockResolvedValue([]);
        await expect(service.listQueueEntries()).resolves.toEqual([]);
    });
    it('throws not found when a specific queue entry cannot be resolved', async () => {
        const { repository, service } = makeService();
        repository.findQueueEntryByOrderId.mockResolvedValue(null);
        await expect(service.getQueueEntry('order_missing')).rejects.toMatchObject({
            status: common_1.HttpStatus.NOT_FOUND,
        });
    });
});
//# sourceMappingURL=dispatch-query.service.spec.js.map